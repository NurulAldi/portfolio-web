import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth-server';
import type { ContentBlock } from '@/lib/projects';

// GET /api/projects/[id] - Get a single project (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    // Fetch project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Fetch content blocks
    const { data: blocks, error: blocksError } = await supabase
      .from('content_blocks')
      .select('*')
      .eq('project_id', id)
      .order('order_index', { ascending: true });

    if (blocksError) {
      return NextResponse.json(
        { error: blocksError.message },
        { status: 500 }
      );
    }

    const completeProject = {
      id: project.id,
      slug: project.slug,
      title: project.title,
      summary: project.summary,
      description: blocks?.map(b => ({
        id: b.id,
        type: b.type as ContentBlock['type'],
        content: b.content as string | string[],
      })) || [],
      tags: project.tags,
      image: project.image,
      githubUrl: project.github_url,
    };

    return NextResponse.json(completeProject);
  } catch (error) {
    console.error('GET /api/projects/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Update a project (requires authentication)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const { requireAuth } = await import('@/lib/auth-server');
    try {
      await requireAuth();
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const { id } = await params;
    const body = await request.json();
    const { slug, title, summary, description, tags, image, githubUrl } = body;

    // Update project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .update({
        slug,
        title,
        summary,
        tags,
        image,
        github_url: githubUrl || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (projectError) {
      return NextResponse.json(
        { error: projectError.message },
        { status: 500 }
      );
    }

    // Delete existing content blocks
    await supabase
      .from('content_blocks')
      .delete()
      .eq('project_id', id);

    // Insert new content blocks
    if (description && Array.isArray(description) && description.length > 0) {
      const blocksToInsert = description.map((block: ContentBlock, index: number) => ({
        project_id: id,
        type: block.type,
        content: block.content,
        order_index: index,
      }));

      const { error: blocksError } = await supabase
        .from('content_blocks')
        .insert(blocksToInsert);

      if (blocksError) {
        return NextResponse.json(
          { error: blocksError.message },
          { status: 500 }
        );
      }
    }

    // Fetch the complete updated project with blocks
    const { data: blocks } = await supabase
      .from('content_blocks')
      .select('*')
      .eq('project_id', id)
      .order('order_index', { ascending: true });

    const completeProject = {
      id: project.id,
      slug: project.slug,
      title: project.title,
      summary: project.summary,
      description: blocks?.map(b => ({
        id: b.id,
        type: b.type as ContentBlock['type'],
        content: b.content as string | string[],
      })) || [],
      tags: project.tags,
      image: project.image,
      githubUrl: project.github_url,
    };

    return NextResponse.json(completeProject);
  } catch (error) {
    console.error('PUT /api/projects/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete a project (requires authentication)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const { requireAuth } = await import('@/lib/auth-server');
    try {
      await requireAuth();
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    // Delete project (content_blocks will be deleted automatically due to CASCADE)
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/projects/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
