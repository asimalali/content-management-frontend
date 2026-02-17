import { useState } from 'react';
import { Check, Loader2, Sparkles, Crown, Rocket, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  usePlans,
  useSubscription,
  useCreateSubscription,
  useUpgradeSubscription,
  useCancelSubscription,
  type Plan,
} from '@/features/subscriptions';
import { useCreditBalance } from '@/features/credits';
import { useCreateCheckout } from '@/features/payments';
import { useConfig } from '@/features/config';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils';

// Plan icons based on slug
const planIcons: Record<string, React.ElementType> = {
  free: Sparkles,
  starter: Rocket,
  professional: Crown,
  enterprise: Building2,
};

// Plan colors
const planColors: Record<string, string> = {
  free: 'border-muted',
  starter: 'border-blue-500',
  professional: 'border-primary ring-2 ring-primary/20',
  enterprise: 'border-purple-500',
};

function PlanCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <Skeleton className="h-10 w-10 rounded-lg mb-2" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
      <CardContent className="flex-1">
        <Skeleton className="h-10 w-32 mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

function PlanCard({
  plan,
  currentPlanId,
  onSelect,
  isLoading,
}: {
  plan: Plan;
  currentPlanId?: string;
  onSelect: (plan: Plan) => void;
  isLoading: boolean;
}) {
  const Icon = planIcons[plan.slug] || Sparkles;
  const isCurrentPlan = currentPlanId === plan.id;
  const isProfessional = plan.slug === 'professional';

  // Get visible features
  const visibleFeatures = plan.features.filter(f => f.isVisible);

  return (
    <Card
      className={cn(
        'flex flex-col relative transition-all hover:shadow-lg',
        planColors[plan.slug],
        isProfessional && 'scale-105'
      )}
    >
      {isProfessional && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
          الأكثر شعبية
        </Badge>
      )}

      <CardHeader>
        <div className={cn(
          'h-12 w-12 rounded-lg flex items-center justify-center mb-2',
          isProfessional ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}>
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription>
          {plan.creditsMonthly} وحدة شهرياً
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="mb-6">
          <span className="text-4xl font-bold">
            {plan.priceMonthly === 0 ? 'مجاني' : `$${plan.priceMonthly}`}
          </span>
          {plan.priceMonthly > 0 && (
            <span className="text-muted-foreground">/شهر</span>
          )}
        </div>

        <ul className="space-y-3">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span className="text-sm">{plan.creditsMonthly} وحدة محتوى</span>
          </li>
          {visibleFeatures.map((feature) => (
            <li key={feature.key} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm">{feature.displayName}: {feature.value}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        {isCurrentPlan ? (
          <Button variant="outline" className="w-full" disabled>
            الباقة الحالية
          </Button>
        ) : (
          <Button
            className="w-full"
            variant={isProfessional ? 'default' : 'outline'}
            onClick={() => onSelect(plan)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin ml-2" />
            ) : null}
            {currentPlanId ? 'الترقية' : 'اشترك الآن'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default function PlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Fetch data
  const { data: plans, isLoading: isLoadingPlans } = usePlans();
  const { data: subscription, isLoading: isLoadingSubscription } = useSubscription();
  const { data: creditBalance } = useCreditBalance();
  const { data: config } = useConfig();

  // Mutations
  const createSubscription = useCreateSubscription();
  const upgradeSubscription = useUpgradeSubscription();
  const cancelSubscription = useCancelSubscription();
  const createCheckout = useCreateCheckout();

  const isLoading = isLoadingPlans || isLoadingSubscription;
  const isMutating = createSubscription.isPending || upgradeSubscription.isPending || createCheckout.isPending;

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  const handleConfirmSubscription = () => {
    if (!selectedPlan) return;

    // Check if payment bypass is enabled OR it's a free plan
    const shouldBypassPayment = config?.bypassPaymentGateway || selectedPlan.priceMonthly === 0;

    // For paid plans without bypass, redirect to checkout
    if (selectedPlan.priceMonthly > 0 && !shouldBypassPayment) {
      createCheckout.mutate(
        {
          planId: selectedPlan.id,
          successUrl: `${window.location.origin}/plans?success=true`,
          cancelUrl: `${window.location.origin}/plans?canceled=true`,
        },
        {
          onSuccess: (response) => {
            if (response.success && response.checkoutUrl) {
              // Redirect happens in the hook
              toast.info('جاري توجيهك لصفحة الدفع...');
            } else {
              toast.error(response.errorMessage || 'فشل إنشاء جلسة الدفع');
            }
          },
          onError: () => {
            toast.error('فشل إنشاء جلسة الدفع');
          },
        }
      );
      return;
    }

    // For free plans OR when bypass is enabled, create subscription directly
    if (subscription) {
      // Upgrade existing subscription
      upgradeSubscription.mutate(
        { newPlanId: selectedPlan.id },
        {
          onSuccess: () => {
            toast.success(`تمت الترقية إلى ${selectedPlan.name} بنجاح`);
            setSelectedPlan(null);
          },
          onError: () => {
            toast.error('فشلت عملية الترقية');
          },
        }
      );
    } else {
      // Create new subscription (free plan or payment bypassed)
      createSubscription.mutate(
        { planId: selectedPlan.id },
        {
          onSuccess: () => {
            toast.success(`تم الاشتراك في ${selectedPlan.name} بنجاح`);
            setSelectedPlan(null);
          },
          onError: () => {
            toast.error('فشلت عملية الاشتراك');
          },
        }
      );
    }
  };

  const handleCancelSubscription = () => {
    cancelSubscription.mutate(undefined, {
      onSuccess: () => {
        toast.success('تم إلغاء الاشتراك');
        setCancelDialogOpen(false);
      },
      onError: () => {
        toast.error('فشل إلغاء الاشتراك');
      },
    });
  };

  // Sort plans by price
  const sortedPlans = plans?.slice().sort((a, b) => a.priceMonthly - b.priceMonthly);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">اختر باقتك</h1>
        <p className="text-muted-foreground mt-2">
          اختر الباقة المناسبة لاحتياجاتك وابدأ بإنشاء محتوى احترافي
        </p>
      </div>

      {/* Current Subscription Info */}
      {subscription && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-lg">باقتك الحالية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg">{subscription.planName}</p>
                <p className="text-sm text-muted-foreground">
                  تنتهي في {formatDate(subscription.currentPeriodEnd)}
                </p>
                {creditBalance && (
                  <p className="text-sm text-muted-foreground mt-1">
                    الرصيد المتبقي: <span className="font-medium">{creditBalance.available} وحدة</span>
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Badge variant={subscription.status === 'Active' ? 'default' : 'secondary'}>
                  {subscription.status === 'Active' ? 'نشط' : subscription.status}
                </Badge>
                {subscription.status === 'Active' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCancelDialogOpen(true)}
                  >
                    إلغاء الاشتراك
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto px-4">
        {isLoading ? (
          <>
            <PlanCardSkeleton />
            <PlanCardSkeleton />
            <PlanCardSkeleton />
            <PlanCardSkeleton />
          </>
        ) : sortedPlans?.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            currentPlanId={subscription?.planId}
            onSelect={handleSelectPlan}
            isLoading={isMutating && selectedPlan?.id === plan.id}
          />
        ))}
      </div>

      {/* Features Comparison Note */}
      <div className="text-center text-sm text-muted-foreground max-w-2xl mx-auto">
        <p>جميع الباقات تشمل الوصول للذكاء الاصطناعي وجميع القوالب المتاحة</p>
        <p className="mt-1">يمكنك الترقية أو تغيير باقتك في أي وقت</p>
      </div>

      {/* Subscription Confirmation Dialog */}
      <AlertDialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {subscription ? 'تأكيد الترقية' : 'تأكيد الاشتراك'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedPlan && (
                <>
                  {subscription
                    ? `سيتم ترقية اشتراكك إلى باقة ${selectedPlan.name}`
                    : `سيتم اشتراكك في باقة ${selectedPlan.name}`
                  }
                  {selectedPlan.priceMonthly > 0 && (
                    <span className="block mt-2">
                      التكلفة: ${selectedPlan.priceMonthly}/شهر
                    </span>
                  )}
                  <span className="block mt-1">
                    ستحصل على {selectedPlan.creditsMonthly} وحدة محتوى شهرياً
                  </span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isMutating}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubscription} disabled={isMutating}>
              {isMutating && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              تأكيد
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Subscription Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من إلغاء الاشتراك؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم إلغاء اشتراكك في نهاية الفترة الحالية. لن تتمكن من استخدام الميزات المدفوعة بعد ذلك.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelSubscription.isPending}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={cancelSubscription.isPending}
            >
              {cancelSubscription.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              تأكيد الإلغاء
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
