import { useState, useEffect } from 'react'
import { NextPage } from 'next'
import { observer } from 'mobx-react-lite'
import { useRouter } from 'next/router'

import { withAuth, useStore } from 'hooks'
import { get } from 'lib/common/fetch'
import { API_URL, STRIPE_PRODUCT_IDS } from 'lib/constants'

import { BillingLayout } from 'components/layouts'
import { ExitSurvey, StripeSubscription } from 'components/interfaces/Billing'

const BillingUpdateFree: NextPage = () => {
  const { ui } = useStore()
  const router = useRouter()
  const projectRef = ui.selectedProject?.ref

  const [products, setProducts] = useState<{ tiers: any[]; addons: any[] }>()
  const [subscription, setSubscription] = useState<StripeSubscription>()
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)

  useEffect(() => {
    if (projectRef) {
      getStripeProducts()
      getSubscription()
    }
  }, [projectRef])

  const getStripeProducts = async () => {
    try {
      setIsLoadingProducts(true)
      const products = await get(`${API_URL}/stripe/products`)
      setProducts(products)
      setIsLoadingProducts(false)
    } catch (error: any) {
      ui.setNotification({
        error,
        category: 'error',
        message: `Failed to get products: ${error.message}`,
      })
    }
  }

  const getSubscription = async () => {
    try {
      if (!ui.selectedProject?.subscription_id) {
        throw new Error('Unable to get subscription ID of project')
      }

      const subscription = await get(`${API_URL}/projects/${projectRef}/subscription`)
      if (subscription.error) throw subscription.error
      setSubscription(subscription)
    } catch (error: any) {
      ui.setNotification({
        error,
        category: 'error',
        message: `Failed to get subscription: ${error.message}`,
      })
    }
  }

  const freeTier = products?.tiers.find((tier: any) => tier.id === STRIPE_PRODUCT_IDS.FREE)

  return (
    <BillingLayout>
      <div className="mx-auto max-w-5xl my-10">
        <ExitSurvey
          freeTier={freeTier}
          subscription={subscription}
          onSelectBack={() => router.push(`/project/${projectRef}/settings/billing/update`)}
        />
      </div>
    </BillingLayout>
  )
}

export default withAuth(observer(BillingUpdateFree))
