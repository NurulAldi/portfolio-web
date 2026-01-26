'use client';

import { getAllProjects } from '@/lib/projects';
import ProjectCard from '@/components/ProjectCard';
import { FormEvent, useState, useEffect } from 'react';

export default function HomePage() {
  const [allProjects, setAllProjects] = useState<Awaited<ReturnType<typeof getAllProjects>>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load projects on client side
    const fetchProjects = async () => {
      const projects = await getAllProjects();
      setAllProjects(projects);
      setIsLoading(false);
    };
    fetchProjects();
  }, []);

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });
    
    try {
      // Submit to our API route (server-side)
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: 'Thank you for your message! I will get back to you soon.',
        });
        setFormState({ name: '', email: '', message: '' });
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.error || 'Failed to send message. Please try again.',
        });
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus({
        type: 'error',
        message: 'An error occurred. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="min-h-[calc(100vh-4rem)] flex items-center section-container py-16 md:py-24 lg:py-32">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-6 md:space-y-8">
            {/* Greeting */}
            <div className="space-y-4">
              <p className="text-primary text-lg md:text-xl font-medium animate-fade-in">
                Hi there, I'm
              </p>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-slate-900 tracking-tight">
                <span className="block">Nurul Aldi</span>
              </h1>
            </div>

            {/* Tagline */}
            <p className="text-xl md:text-2xl lg:text-3xl font-semibold text-slate-700 max-w-4xl mx-auto leading-tight text-balance">
              I transform <span className="text-primary">data</span> into{' '}
              <span className="text-primary">actionable insights</span>
            </p>

            {/* Description */}
            <p className="text-base md:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Data scientist specializing in machine learning and statistical analysis. 
              I uncover patterns, build predictive models, and create data-driven solutions 
              that drive business impact.
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-3 md:gap-4 justify-center flex-wrap pt-4">
              <a 
                href="#projects" 
                className="btn-primary"
              >
                View My Work
              </a>
              <a 
                href="#contact" 
                className="btn-secondary"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="min-h-[calc(100vh-4rem)] bg-slate-50/50">
        <div className="section-container py-16 md:py-20">
          {/* Header */}
          <div className="max-w-3xl mb-12 md:mb-16">
            <h2 className="text-slate-900 mb-4">
              My Projects
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-slate-600">
              A collection of data science projects leveraging machine learning and analytics. 
              Each project demonstrates different techniques for extracting insights and solving complex problems with data.
            </p>
          </div>

          {/* Projects Grid */}
          {isLoading ? (
            <div className="text-center py-20">
              <div className="animate-pulse text-slate-400">Loading projects...</div>
            </div>
          ) : allProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {allProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-slate-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-slate-600 text-lg">No projects available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="min-h-[calc(100vh-4rem)] section-container py-16 md:py-20">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-slate-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto">
              Have a data challenge or want to collaborate on analytics? I'd love to hear from you. 
              Fill out the form below and I'll get back to you as soon as possible.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-8 md:gap-12">
            {/* Contact Form */}
            <div className="md:col-span-3">
              <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                {/* Name Field */}
                <div>
                  <label 
                    htmlFor="name" 
                    className="block text-sm font-semibold text-slate-900 mb-2"
                  >
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="input-field"
                    placeholder="Your name"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label 
                    htmlFor="email" 
                    className="block text-sm font-semibold text-slate-900 mb-2"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="input-field"
                    placeholder="your.email@example.com"
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label 
                    htmlFor="message" 
                    className="block text-sm font-semibold text-slate-900 mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    rows={6}
                    className="input-field resize-none"
                    placeholder="Tell me about your data challenge or project..."
                  />
                </div>

                {/* Status Message */}
                {submitStatus.type && (
                  <div className={`p-4 rounded-lg border-2 ${
                    submitStatus.type === 'success' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex gap-3">
                      <svg 
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          submitStatus.type === 'success' ? 'text-green-600' : 'text-red-600'
                        }`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        {submitStatus.type === 'success' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        )}
                      </svg>
                      <p className={`text-sm font-medium ${
                        submitStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {submitStatus.message}
                      </p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full md:w-auto shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>

            {/* Contact Info Sidebar */}
            <div className="md:col-span-2 space-y-6 md:space-y-8">
              {/* Email */}
              <div className="card card-hover p-5 md:p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Email</h3>
                    <a href="mailto:nurulaldi333@gmail.com" className="text-slate-600 hover:text-primary transition-colors">
                      nurulaldi333@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Based In */}
              <div className="card card-hover p-5 md:p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Based In</h3>
                    <p className="text-slate-600">Padang, Indonesia</p>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-slate-50 p-5 md:p-6 rounded-lg border border-slate-200">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-slate-600">
                      I typically respond within <strong className="text-slate-900">24-48 hours</strong> during business days.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
