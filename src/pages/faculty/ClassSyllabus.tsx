import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, Check, CheckCircle2, ChevronDown, ChevronUp,
  Clock, Eye, EyeOff, FileText, Layers, Plus, Save, Send, Trash2,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { syllabusService } from '../../services/syllabusService';
import type { CourseSyllabus, SyllabusModule } from '../../types/course';
import { clsx } from 'clsx';

interface ClassInfo {
  id: string;
  subject: string;
  subjectCode: string;
  section: string;
  sectionName: string;
  semester: number;
}

const recalculate = (module: SyllabusModule): SyllabusModule => ({
  ...module,
  progress:
    module.topics.length === 0
      ? 0
      : Math.round((module.completedTopicIds.length / module.topics.length) * 100),
});

const newId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const ClassSyllabus: React.FC = () => {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();

  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [syllabus, setSyllabus] = useState<CourseSyllabus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!classId) {
        setError('No class selected.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const data = await syllabusService.getFacultyClass(classId);
        if (!mounted) return;
        setClassInfo(data.class);
        setSyllabus(data.syllabus);
        setExpandedModules(data.syllabus.modules.slice(0, 1).map(module => module.id));
      } catch (err: any) {
        if (mounted) setError(err.response?.data?.message || 'Could not load the syllabus for this class.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [classId]);

  const updateModules = (updater: (modules: SyllabusModule[]) => SyllabusModule[]) => {
    setSyllabus(previous => {
      if (!previous) return previous;
      const modules = updater(previous.modules);
      const overallProgress = modules.length
        ? Math.round(modules.reduce((sum, module) => sum + module.progress, 0) / modules.length)
        : 0;
      return { ...previous, modules, overallProgress };
    });
  };

  const updateModule = (moduleId: string, updater: (module: SyllabusModule) => SyllabusModule) => {
    updateModules(modules => modules.map(module => (module.id === moduleId ? recalculate(updater(module)) : module)));
  };

  const toggleModuleExpanded = (moduleId: string) => {
    setExpandedModules(previous =>
      previous.includes(moduleId) ? previous.filter(id => id !== moduleId) : [...previous, moduleId]
    );
  };

  const toggleTopic = (moduleId: string, topicId: string) => {
    updateModule(moduleId, module => ({
      ...module,
      completedTopicIds: module.completedTopicIds.includes(topicId)
        ? module.completedTopicIds.filter(id => id !== topicId)
        : [...module.completedTopicIds, topicId],
    }));
  };

  const setTaughtUntil = (moduleId: string, topicId: string) => {
    updateModule(moduleId, module => {
      const index = module.topics.findIndex(topic => topic.id === topicId);
      const completed = index < 0 ? [] : module.topics.slice(0, index + 1).map(topic => topic.id);
      return { ...module, completedTopicIds: completed };
    });
  };

  const markAllTaught = (moduleId: string) => {
    updateModule(moduleId, module => ({
      ...module,
      completedTopicIds: module.topics.map(topic => topic.id),
    }));
  };

  const clearProgress = (moduleId: string) => {
    updateModule(moduleId, module => ({ ...module, completedTopicIds: [] }));
  };

  const addModule = () => {
    const id = newId('module');
    updateModules(modules => [
      ...modules,
      recalculate({
        id,
        title: `Module ${modules.length + 1}`,
        hours: '',
        description: '',
        topics: [],
        completedTopicIds: [],
        progress: 0,
      }),
    ]);
    setExpandedModules(previous => [...previous, id]);
  };

  const removeModule = (moduleId: string) => {
    updateModules(modules => modules.filter(module => module.id !== moduleId));
  };

  const addTopic = (moduleId: string) => {
    updateModule(moduleId, module => ({
      ...module,
      topics: [...module.topics, { id: newId('topic'), name: '' }],
    }));
  };

  const updateTopicName = (moduleId: string, topicId: string, name: string) => {
    updateModule(moduleId, module => ({
      ...module,
      topics: module.topics.map(topic => (topic.id === topicId ? { ...topic, name } : topic)),
    }));
  };

  const removeTopic = (moduleId: string, topicId: string) => {
    updateModule(moduleId, module => ({
      ...module,
      topics: module.topics.filter(topic => topic.id !== topicId),
      completedTopicIds: module.completedTopicIds.filter(id => id !== topicId),
    }));
  };

  const handleSave = async (publish: boolean) => {
    if (!syllabus || !classId) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const saved = await syllabusService.saveFacultyClass(classId, {
        modules: syllabus.modules,
        isPublished: publish,
      });
      setSyllabus(saved);
      setNotice(
        publish
          ? 'Published to students. They can now view this syllabus in My Courses.'
          : 'Draft saved. Students cannot see these changes yet.'
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save the syllabus.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-8 h-8 border-2 border-[#542536] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-[#79666A] font-medium">Loading syllabus workspace...</p>
      </div>
    );
  }

  if (!syllabus) {
    return (
      <div className="space-y-5">
        <PageHeader
          title="Syllabus"
          subtitle="Manage and publish your class syllabus"
          breadcrumbs={[{ label: 'Dashboard', to: '/faculty/select-class' }, { label: 'Syllabus' }]}
        />
        <Card className="p-10 text-center">
          <FileText className="w-9 h-9 text-[#C58D98] mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#302A2B]">{error || 'Syllabus not available.'}</p>
          <Button className="mt-5" variant="outline" onClick={() => navigate('/faculty/select-class')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Classes
          </Button>
        </Card>
      </div>
    );
  }

  const published = syllabus.isPublished;
  const completedTopics = syllabus.modules.reduce(
    (sum, module) => sum + module.completedTopicIds.length,
    0
  );
  const totalTopics = syllabus.modules.reduce((sum, module) => sum + module.topics.length, 0);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title={`Syllabus — ${syllabus.subjectName}`}
        subtitle={`${syllabus.subjectCode} · ${classInfo?.section || `Section ${syllabus.sectionName}`} · Semester ${syllabus.semester || classInfo?.semester || '—'}`}
        breadcrumbs={[
          { label: 'Dashboard', to: '/faculty/select-class' },
          { label: classInfo?.subject || syllabus.subjectName, to: `/faculty/class/${classId}` },
          { label: 'Syllabus' },
        ]}
        action={
          <Button variant="outline" size="sm" onClick={() => navigate(`/faculty/class/${classId}`)}
            leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Class
          </Button>
        }
      />

      {error && (
        <div className="p-3 rounded-xl border border-[#8b2c35]/30 bg-[#8b2c35]/5 text-xs font-medium text-[#8b2c35]">
          {error}
        </div>
      )}
      {notice && (
        <div className="p-3 rounded-xl border border-[#34483A]/30 bg-[#34483A]/5 text-xs font-medium text-[#34483A]">
          {notice}
        </div>
      )}

      {/* Publish + progress snapshot */}
      <Card className="overflow-hidden">
        <div className="p-5 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-gradient-to-r from-[#F7F1E8] via-white to-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#542536]/10 border border-[#542536]/20 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-[#542536]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-serif font-bold text-[#302A2B]">{syllabus.subjectName}</h2>
                <Badge color={published ? 'forest' : 'gray'} dot>
                  {published ? 'Published to Students' : 'Draft — Not Published'}
                </Badge>
              </div>
              <p className="text-xs text-[#79666A] mt-1 font-medium">
                {syllabus.subjectCode} · Section {syllabus.sectionName || classInfo?.sectionName} ·{' '}
                {syllabus.modules.length} modules · {completedTopics}/{totalTopics} topics taught
              </p>
              <p className="text-[11px] text-[#a08a8e] mt-1">
                Last updated {new Date(syllabus.updatedAt || Date.now()).toLocaleString('en-IN')}
                {syllabus.publishedAt ? ` · Published ${new Date(syllabus.publishedAt).toLocaleString('en-IN')}` : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="min-w-[170px]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#79666A] font-medium">Overall Teaching Progress</span>
                <span className="font-serif font-bold text-[#542536] text-base">{syllabus.overallProgress}%</span>
              </div>
              <ProgressBar value={syllabus.overallProgress} height="sm" color="oxblood" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSave(false)}
                isLoading={saving}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Draft
              </Button>
              <Button
                variant={published ? 'forest' : 'primary'}
                size="sm"
                onClick={() => handleSave(true)}
                isLoading={saving}
                leftIcon={published ? <CheckCircle2 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              >
                {published ? 'Update Published' : 'Publish to Students'}
              </Button>
              {published && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSave(false)}
                  isLoading={saving}
                  leftIcon={<EyeOff className="w-4 h-4" />}
                >
                  Unpublish
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Info strip */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-[11px] text-[#79666A] font-medium">
        <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-[#542536]" /> Edit module titles, topics and hours.</span>
        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#34483A]" /> Tick topics or choose “Taught up to” to set progress.</span>
        <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-[#B69A69]" /> Only published syllabi appear in the student portal.</span>
      </div>

      {/* Modules */}
      <div className="space-y-4">
        {syllabus.modules.length === 0 && (
          <Card className="p-12 text-center">
            <FileText className="w-9 h-9 text-[#C58D98] mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#302A2B]">No modules yet</p>
            <p className="text-xs text-[#79666A] mt-1">Add your first module to start building this syllabus.</p>
          </Card>
        )}

        {syllabus.modules.map((module, moduleIndex) => {
          const expanded = expandedModules.includes(module.id);
          const label = module.moduleNumber ? `Module ${module.moduleNumber}` : `Module ${moduleIndex + 1}`;
          return (
            <Card key={module.id} className="overflow-hidden">
              <div
                className="p-4 md:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#F7F1E8]/60 transition-colors select-none"
                onClick={() => toggleModuleExpanded(module.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#34483A]/10 text-[#34483A] flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    {module.moduleNumber || moduleIndex + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-[#a08a8e]">{label}</span>
                      <h3 className="font-serif font-bold text-base text-[#302A2B] truncate">{module.title || 'Untitled Module'}</h3>
                      <Badge color={module.progress === 100 ? 'forest' : module.progress > 0 ? 'brass' : 'gray'} className="text-[10px]">
                        {module.progress === 100 ? 'Completed' : module.progress > 0 ? 'In Progress' : 'Not Started'}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-[#79666A] mt-0.5">
                      {module.completedTopicIds.length}/{module.topics.length} topics taught
                      {module.hours ? ` · ${module.hours}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="hidden sm:block w-32">
                    <ProgressBar value={module.progress} height="xs" color={module.progress === 100 ? 'forest' : 'oxblood'} />
                  </div>
                  <span className="text-sm font-serif font-bold text-[#542536] w-10 text-right">{module.progress}%</span>
                  {expanded ? <ChevronUp className="w-4 h-4 text-[#a08a8e]" /> : <ChevronDown className="w-4 h-4 text-[#a08a8e]" />}
                </div>
              </div>

              {expanded && (
                <div className="border-t border-[#E1D4CA] p-4 md:p-5 space-y-5 bg-white">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-[#a08a8e]">Module Title</span>
                      <input
                        value={module.title}
                        onChange={e => updateModule(module.id, current => ({ ...current, title: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-[#E1D4CA] px-3 py-2 text-xs text-[#302A2B] outline-none focus:border-[#542536]"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-[#a08a8e]">Hours / Duration</span>
                      <input
                        value={module.hours || ''}
                        placeholder="e.g. 10 Hours"
                        onChange={e => updateModule(module.id, current => ({ ...current, hours: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-[#E1D4CA] px-3 py-2 text-xs text-[#302A2B] outline-none focus:border-[#542536]"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#a08a8e]">Description / Overview</span>
                    <textarea
                      value={module.description || ''}
                      rows={2}
                      onChange={e => updateModule(module.id, current => ({ ...current, description: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-[#E1D4CA] px-3 py-2 text-xs text-[#302A2B] outline-none focus:border-[#542536] resize-y"
                    />
                  </label>

                  {/* Teaching progress */}
                  <div className="rounded-xl border border-[#E1D4CA] bg-[#F7F1E8]/60 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#302A2B]">
                        <Clock className="w-4 h-4 text-[#542536]" />
                        Till where have you completed teaching this module?
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={module.completedTopicIds[module.completedTopicIds.length - 1] || ''}
                          onChange={e => setTaughtUntil(module.id, e.target.value)}
                          className="rounded-lg border border-[#E1D4CA] bg-white px-2.5 py-1.5 text-[11px] text-[#302A2B] outline-none focus:border-[#542536] max-w-[260px]"
                        >
                          <option value="">Nothing taught yet</option>
                          {module.topics.map(topic => (
                            <option key={topic.id} value={topic.id}>{topic.name || 'Untitled topic'}</option>
                          ))}
                        </select>
                        <Button variant="ghost" size="sm" onClick={() => markAllTaught(module.id)}>Mark all taught</Button>
                        <Button variant="ghost" size="sm" onClick={() => clearProgress(module.id)}>Clear</Button>
                      </div>
                    </div>
                    <ProgressBar value={module.progress} height="sm" color={module.progress === 100 ? 'forest' : 'oxblood'} />
                    <p className="text-[10px] text-[#79666A] mt-1.5 font-medium">
                      {module.progress}% taught · {module.completedTopicIds.length} of {module.topics.length} topics completed
                    </p>
                  </div>

                  {/* Topics */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-[#a08a8e]">
                        Topics ({module.topics.length})
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => addTopic(module.id)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                        Add Topic
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {module.topics.map((topic, topicIndex) => {
                        const done = module.completedTopicIds.includes(topic.id);
                        return (
                          <div key={topic.id} className={clsx(
                            'flex items-center gap-2.5 p-2 rounded-lg border transition-colors',
                            done ? 'bg-[#34483A]/5 border-[#34483A]/25' : 'bg-white border-[#E1D4CA]'
                          )}>
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); toggleTopic(module.id, topic.id); }}
                              className={clsx(
                                'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors',
                                done ? 'bg-[#34483A] text-white' : 'border border-[#C9B9AE] text-transparent hover:border-[#34483A]'
                              )}
                              title={done ? 'Mark as not taught' : 'Mark as taught'}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </button>
                            <span className="text-[10px] font-bold text-[#a08a8e] w-5 flex-shrink-0">{topicIndex + 1}.</span>
                            <input
                              value={topic.name}
                              placeholder="Topic name"
                              onClick={e => e.stopPropagation()}
                              onChange={e => updateTopicName(module.id, topic.id, e.target.value)}
                              className="flex-1 min-w-0 bg-transparent text-xs text-[#302A2B] outline-none"
                            />
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); removeTopic(module.id, topic.id); }}
                              className="text-[#a08a8e] hover:text-[#8b2c35] p-1 flex-shrink-0"
                              title="Remove topic"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                      {module.topics.length === 0 && (
                        <p className="text-xs text-[#a08a8e] text-center py-4 border border-dashed border-[#E1D4CA] rounded-lg">
                          No topics yet. Add at least one topic to track teaching progress.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button variant="ghost" size="sm" onClick={() => removeModule(module.id)}
                      leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
                      Remove Module
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}

        <button
          type="button"
          onClick={addModule}
          className="w-full py-4 rounded-xl border-2 border-dashed border-[#E1D4CA] hover:border-[#542536] text-xs font-semibold text-[#79666A] hover:text-[#542536] flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Module
        </button>
      </div>
    </div>
  );
};
