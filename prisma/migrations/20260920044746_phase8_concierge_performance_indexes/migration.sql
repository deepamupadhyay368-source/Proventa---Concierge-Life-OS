-- CreateIndex
CREATE INDEX "orchestrated_tasks_category_idx" ON "orchestrated_tasks"("category");

-- CreateIndex
CREATE INDEX "orchestrated_tasks_isEscalated_idx" ON "orchestrated_tasks"("isEscalated");

-- CreateIndex
CREATE INDEX "orchestrated_tasks_updatedAt_idx" ON "orchestrated_tasks"("updatedAt");

-- CreateIndex
CREATE INDEX "orchestrated_tasks_status_updatedAt_idx" ON "orchestrated_tasks"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "task_events_eventType_idx" ON "task_events"("eventType");
