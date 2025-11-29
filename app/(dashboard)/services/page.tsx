import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Plus } from 'lucide-react'

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground">Manage your service catalog</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>

      {/* Services Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">No services yet</CardTitle>
            <CardDescription>Add your first service to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Create Service
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
