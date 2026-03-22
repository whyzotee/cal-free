import { createFileRoute } from '@tanstack/react-router'
import { Overview } from '../components/Overview'

export const Route = createFileRoute('/overview')({
  component: OverviewPage,
})

function OverviewPage() {
  return <Overview />
}
