import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import VyronClient from './vyron-client'

export default async function Page() {
  const session = await auth()

  if (!session?.user) {
    redirect('/api/auth/signin?callbackUrl=/')
  }

  return <VyronClient />
}