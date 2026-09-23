import { NextRequest } from 'next/server';
import { ProjectService } from '@/lib/projects/project-service';
import { apiSuccess, apiError } from '@/lib/response';
import { ProjectStage } from '@prisma/client';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ idOrNumber: string }> }
) {
  try {
    const { idOrNumber } = await params;
    const body = await req.json();
    const { newStage, closureReportSummary, actualCompletionDate } = body;

    const project = await ProjectService.getProject(idOrNumber);
    if (!project) {
      return apiError(new Error('Project not found.'));
    }

    const updated = await ProjectService.updateProjectStage({
      projectId: project.id,
      newStage: newStage as ProjectStage,
      closureReportSummary,
      actualCompletionDate,
    });

    return apiSuccess(
      updated,
      `Project #${project.projectNumber} stage transitioned to ${newStage}.`,
      200
    );
  } catch (error) {
    return apiError(error);
  }
}
