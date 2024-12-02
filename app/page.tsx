import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to medications page by default
  redirect('/medications')
}