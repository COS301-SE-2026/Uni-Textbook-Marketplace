"use client";
import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Modal,
} from "@/components/ui";

export default function UITestPage() {
  const [open, setOpen] = useState(false);
  return (
    <main className="container-content py-10 space-y-8">
      <h1>UI Component Library</h1>
      <Card className="space-y-4">
        <h3>Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
        </div>
      </Card>
      <Card className="space-y-4">
        <h3>Badges</h3>
        <div className="flex gap-4">
          <Badge variant="pending"><span>Pending</span></Badge>
          <Badge variant="approved"><span>Approved</span></Badge>
          <Badge variant="rejected"><span>Rejected</span></Badge>
        </div>
      </Card>
      <Card>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
      </Card>
      <Modal isOpen={open} title="Example Modal" onClose={() => setOpen(false)}>
        <p>This is a reusable modal component.</p>
      </Modal>
    </main>
  );
}