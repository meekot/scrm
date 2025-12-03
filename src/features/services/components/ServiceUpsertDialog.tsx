import { Button } from '@/shared/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/shared/ui/dialog';
import { ServiceForm } from './ServiceForm';
import { useToast } from '@/shared/ui/toast';
import { useState } from 'react';
import { Supabase } from '@/shared/supabase';

export function ServiceUpsertDialog({entityId, supabase}: {entityId: string, supabase: Supabase}) {
    const { addToast } = useToast();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    return (<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogTrigger asChild>
            <Button>Create service</Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create service</DialogTitle>
                <DialogDescription>Add a new service for this entity.</DialogDescription>
            </DialogHeader>
            <ServiceForm
                client={supabase}
                entityId={entityId}
                mode="create"
                onCreated={() => {
                    setIsCreateOpen(false);
                    addToast({ title: 'Service created', description: 'Your service was added.' });
                }}
            />
        </DialogContent>
    </Dialog>)
}
