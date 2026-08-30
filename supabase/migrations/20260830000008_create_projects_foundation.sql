-- Projects Foundation Migration
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Web',
  difficulty TEXT NOT NULL DEFAULT 'Beginner',
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  step_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_steps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Projects
CREATE POLICY "Public read published projects" ON public.projects
  FOR SELECT USING (is_published = true OR public.is_admin());

CREATE POLICY "Admin manage projects" ON public.projects
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- RLS Policies for Project Steps
CREATE POLICY "Public read published project steps" ON public.project_steps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_steps.project_id
        AND (projects.is_published = true OR public.is_admin())
    )
  );

CREATE POLICY "Admin manage project steps" ON public.project_steps
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Seed Starter Projects and Steps
INSERT INTO public.projects (id, title, slug, description, instructions, category, difficulty, is_published)
VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    'Personal Portfolio Website',
    'personal-portfolio-website',
    'Build a clean, responsive developer portfolio showcasing your skills, bio, and featured quests.',
    'Structure your markup with semantic tags, create modern flex/grid layouts with CSS, and deploy to the web.',
    'Web',
    'Beginner',
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'Interactive Task Matrix',
    'interactive-task-matrix',
    'Create an interactive productivity tracker with state management and local storage persistence.',
    'Implement task creation, toggling completion, filtering views, and persisting task state in localStorage.',
    'JavaScript',
    'Beginner',
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000003',
    'Markdown Note Engine',
    'markdown-note-engine',
    'Develop a real-time markdown editor with instant preview parsing and category tagging.',
    'Assemble React components with dual-pane layout, controlled editor state, and export options.',
    'React',
    'Intermediate',
    true
  )
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.project_steps (id, project_id, title, description, step_order)
VALUES
  (
    'b1000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Structure Semantic HTML',
    'Create index.html with a semantic header, about bio, project showcase grid, and contact footer.',
    1
  ),
  (
    'b1000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'Apply Responsive Styles',
    'Implement responsive CSS styling with mobile-first media queries and clean typography.',
    2
  ),
  (
    'b1000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    'Add Interactivity & Polish',
    'Add theme toggle, smooth scrolling navigation, and validation to the contact form.',
    3
  ),
  (
    'b1000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000002',
    'DOM Manipulation & Event Binding',
    'Create UI input fields and write event listeners to dynamically insert new task cards.',
    1
  ),
  (
    'b1000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000002',
    'Local Storage Synchronization',
    'Serialize task data to JSON and sync to window.localStorage on every mutation.',
    2
  ),
  (
    'b1000000-0000-0000-0000-000000000006',
    'b0000000-0000-0000-0000-000000000002',
    'Filtering & Active Counts',
    'Add filter buttons for All, Active, and Completed tasks, plus an active counter indicator.',
    3
  ),
  (
    'b1000000-0000-0000-0000-000000000007',
    'b0000000-0000-0000-0000-000000000003',
    'Split-Pane Editor Component',
    'Build dual-pane React component connecting raw markdown input to rendered preview HTML.',
    1
  ),
  (
    'b1000000-0000-0000-0000-000000000008',
    'b0000000-0000-0000-0000-000000000003',
    'Category Tagging & Search',
    'Enable assigning tags to notes and instant client-side searching across notes.',
    2
  ),
  (
    'b1000000-0000-0000-0000-000000000009',
    'b0000000-0000-0000-0000-000000000003',
    'Export & Download Pipeline',
    'Support exporting individual notes as .md files and downloading note bundles as JSON.',
    3
  )
ON CONFLICT (id) DO NOTHING;
