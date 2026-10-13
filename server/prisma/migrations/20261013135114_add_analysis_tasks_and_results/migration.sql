-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "analysis_tasks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "stored_path" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "analysis_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysis_results" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "total_variants" INTEGER NOT NULL,
    "snp_count" INTEGER NOT NULL,
    "indel_count" INTEGER NOT NULL,
    "het_count" INTEGER NOT NULL,
    "hom_alt_count" INTEGER NOT NULL,
    "het_hom_ratio" DOUBLE PRECISION NOT NULL,
    "ti_tv_ratio" DOUBLE PRECISION NOT NULL,
    "avg_gq" DOUBLE PRECISION,
    "avg_mq" DOUBLE PRECISION,
    "avg_qd" DOUBLE PRECISION,
    "avg_sor" DOUBLE PRECISION,
    "json_result_path" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analysis_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analysis_tasks_user_id_status_idx" ON "analysis_tasks"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "analysis_results_task_id_key" ON "analysis_results"("task_id");

-- AddForeignKey
ALTER TABLE "analysis_tasks" ADD CONSTRAINT "analysis_tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_results" ADD CONSTRAINT "analysis_results_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "analysis_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
