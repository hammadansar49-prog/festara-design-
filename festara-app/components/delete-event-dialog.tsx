"use client";

import { useActionState, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteEventAction } from "@/lib/actions/events";
import type { ActionState } from "@/lib/actions/state";

export function DeleteEventDialog({ eventId, eventName }: { eventId: string; eventName: string }) {
  const [state, action, pending] = useActionState(deleteEventAction.bind(null, eventId), {} as ActionState);
  const [typed, setTyped] = useState("");
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-fit text-over"><Trash2 className="size-4" aria-hidden />Delete event</Button>
      </DialogTrigger>
      <DialogContent>
        <form action={action} className="grid gap-4">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Delete {eventName}?</DialogTitle>
            <DialogDescription>Members, guests and expenses go with it. This can't be undone.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label htmlFor="confirmName">Type the event name to confirm</Label>
            <Input id="confirmName" name="confirmName" autoComplete="off" value={typed} onChange={(ev) => setTyped(ev.target.value)} />
          </div>
          {state.message && <p role="alert" className="text-sm text-over">{state.message}</p>}
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="ghost">Keep event</Button></DialogClose>
            <Button type="submit" variant="destructive" disabled={pending || typed.trim() !== eventName}>
              {pending ? "Deleting" : "Delete event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
