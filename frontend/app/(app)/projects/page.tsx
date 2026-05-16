"use client";

import { useQuery } from "@tanstack/react-query";
import { FolderKanban, Search } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectDialog } from "@/components/projects/project-dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { listProjects } from "@/lib/api/projects";
import { useDebounce } from "@/hooks/use-debounce";

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const projects = useQuery({
    queryKey: ["projects", { search: debouncedSearch }],
    queryFn: () => listProjects({ search: debouncedSearch, ordering: "-updated_at" })
  });

  return (
    <div>
      <PageHeader
        eyebrow="Portfolio"
        title="Projects"
        description="Create delivery spaces, invite collaborators, and keep work visible without losing permission boundaries."
        actions={<ProjectDialog />}
      />

      <div className="relative mb-5 max-w-lg">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search projects" value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>

      {projects.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-64" />
          ))}
        </div>
      ) : projects.data?.results.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.data.results.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description="Create a project to start assigning tasks and tracking team progress."
          action={<ProjectDialog />}
        />
      )}
    </div>
  );
}
