import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth-server';
import { rateLimiter, getClientIp } from '@/lib/rate-limit';
import type { ContentBlock } from '@/lib/projects';

// GET /api/projects - Get all projects (public endpoint)
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Fetch all projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (projectsError) {
      return NextResponse.json(
        { error: projectsError.message },
        { status: 500 }
      );
    }

    // Fetch content blocks for all projects
    const projectIds = projects.map(p => p.id);
    const { data: blocks, error: blocksError } = await supabase
      .from('content_blocks')
      .select('*')
      .in('project_id', projectIds)
      .order('order_index', { ascending: true });

    if (blocksError) {
      return NextResponse.json(
        { error: blocksError.message },
        { status: 500 }
      );
    }

    // Group blocks by project_id
    const blocksMap = new Map<string, ContentBlock[]>();
    blocks?.forEach(block => {
      const projectBlocks = blocksMap.get(block.project_id) || [];
      projectBlocks.push({
        id: block.id,
        type: block.type as ContentBlock['type'],
        content: block.content as string | string[],
      });
      blocksMap.set(block.project_id, projectBlocks);
    });

    // Combine projects with their blocks
    const projectsWithBlocks = projects.map(project => ({
      id: project.id,
      slug: project.slug,
      title: project.title,
      summary: project.summary,
      description: blocksMap.get(project.id) || [],
      tags: project.tags,
      image: project.image,
      githubUrl: project.github_url,
    }));

    return NextResponse.json(projectsWithBlocks);
  } catch (error) {
    console.error('GET /api/projects error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project (requires authentication)
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 requests per hour per IP for creation
    const clientIp = getClientIp(request);
    const rateLimit = rateLimiter.check(`projects-create-${clientIp}`, 10, 60 * 60 * 1000);

    if (!rateLimit.success) {
      const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
          }
        }
      );
    }

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
    const body = await request.json();
    const { slug, title, summary, description, tags, image, githubUrl } = body;

    // Validate required fields
    if (!slug || !title || !summary || !image || !Array.isArray(tags)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        slug,
        title,
        summary,
        tags,
        image,
        github_url: githubUrl || null,
      })
      .select()
      .single();

    if (projectError) {
      return NextResponse.json(
        { error: projectError.message },
        { status: 500 }
      );
    }

    // Insert content blocks
    if (description && Array.isArray(description) && description.length > 0) {
      const blocksToInsert = description.map((block: ContentBlock, index: number) => ({
        project_id: project.id,
        type: block.type,
        content: block.content,
        order_index: index,
      }));

      const { error: blocksError } = await supabase
        .from('content_blocks')
        .insert(blocksToInsert);

      if (blocksError) {
        // Rollback: delete the project if blocks insertion fails
        await supabase.from('projects').delete().eq('id', project.id);
        return NextResponse.json(
          { error: blocksError.message },
          { status: 500 }
        );
      }
    }

    // Fetch the complete project with blocks
    const { data: blocks } = await supabase
      .from('content_blocks')
      .select('*')
      .eq('project_id', project.id)
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

    return NextResponse.json(completeProject, { status: 201 });
  } catch (error) {
    console.error('POST /api/projects error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
