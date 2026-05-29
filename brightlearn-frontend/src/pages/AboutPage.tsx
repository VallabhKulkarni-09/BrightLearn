import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Logo } from '../components/common/Logo';
import { Card } from '../components/common/Card';

export const AboutPage: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Active Learners', value: '15,000+' },
    { label: 'Specialized Courses', value: '120+' },
    { label: 'Success Rate', value: '98.4%' },
    { label: 'Expert Instructors', value: '45+' }
  ];

  const features = [
    {
      title: 'Adaptive Learning Path',
      description:
        'Syllabi engineered to adapt dynamically to your progress, with instant guidance and checkpoints.',
      icon: (
        <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
      )
    },
    {
      title: 'Dual-Feedback Loop',
      description:
        'Our revolutionary dual-feedback system connects course quality directly with administrative metrics.',
      icon: (
        <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      )
    },
    {
      title: 'Cryptographic Credentials',
      description:
        'Every completed course generates a secure, tamper-proof certificate code instantly verifiable by anyone, globally.',
      icon: (
        <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      )
    },
    {
      title: 'Secure Recovery & Management',
      description:
        'Role-based access controls engineered to ensure optimal safety for student data and academic portfolios.',
      icon: (
        <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      )
    }
  ];

  const [activeTab, setActiveTab] = useState('vision');

  const paradigmTabs = [
    {
      id: 'vision',
      label: 'Vision',
      content: (
        <>
          <p>
            BrightLearn's vision is to restore depth and demonstrable skill to digital
            learning. We emphasize applied projects, iterative feedback, and
            portfolio-grade evidence so learners graduate with artifacts that employers trust.
          </p>

          <p className="mt-4">
            This means moving away from vanity metrics and toward a curriculum that
            measures generative ability — the capacity to create, debug, and explain
            solutions under realistic constraints.
          </p>
        </>
      )
    },
    {
      id: 'assessment',
      label: 'Assessment',
      content: (
        <>
          <p>
            Assessments are woven into the workflow: short practical checkpoints,
            peer review loops, and instructor-graded capstone tasks provide layered
            evidence of learning. We use spaced retrieval and adaptive difficulty to
            ensure retention and transfer.
          </p>
        </>
      )
    },
    {
      id: 'credentials',
      label: 'Credentials',
      content: (
        <>
          <p>
            Credentials issued on BrightLearn are cryptographically signed and paired
            with verifiable artifacts. Recipients can share proof-of-skill without
            exposing sensitive learner data.
          </p>
        </>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 bg-noise flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-8 pt-40 pb-20 w-full space-y-24">

        {/* Hero Section */}
        <div className="flex justify-center -mt-12 mb-6">
          <Logo size="xl" showText className="mb-6" />
        </div>

        <section className="text-center max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400 bg-neutral-100/80 px-3 py-1.5 rounded-full">
              BrightLearn Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-7xl font-black text-black tracking-tighter leading-none"
          >
            Mastery,{` `}
            <span className="bg-gradient-to-r from-neutral-800 to-neutral-400 bg-clip-text text-transparent">
              Engineered.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-neutral-700 leading-relaxed font-medium"
          >
            BrightLearn is a modern Learning Management System designed to bridge the
            gap between academic intent and industry execution through deep,
            project-driven learning.
          </motion.p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-8 text-center bg-white border-none shadow-sm hover:shadow-ambient hover:scale-[1.02] transition-all duration-300">
                <span className="block text-3xl font-black text-black tracking-tight mb-2">
                  {stat.value}
                </span>

                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  {stat.label}
                </span>
              </Card>
            </motion.div>
          ))}
        </section>

        {/* Paradigm Section */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Card className="p-10 md:p-16 bg-white border-none shadow-sm min-h-[75vh]">

              <div className="max-w-5xl mx-auto space-y-12">

                {/* Header */}
                <div className="space-y-6">

                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-400">
                    Our Paradigm
                  </span>

                  <h2 className="text-4xl md:text-6xl font-black tracking-tight text-black leading-[0.95] max-w-4xl">
                    A Modern Sanctuary for Practical Knowledge
                  </h2>

                  <p className="text-lg text-neutral-700 leading-relaxed max-w-4xl">
                    At BrightLearn we reject one-size-fits-all education and the
                    shallow metrics that pretend completion equals competence.
                    Traditional indicators like watch-time or checklist completion miss
                    whether a learner can actually apply knowledge under real constraints.
                  </p>

                  <p className="text-lg text-neutral-700 leading-relaxed max-w-4xl">
                    Our paradigm centers on scaffolded, active sequences that demand
                    application, reflection, and spaced retrieval — each step
                    instrumented so progress measures demonstrable mastery rather than
                    passive exposure.
                  </p>

                  <p className="text-lg text-neutral-700 leading-relaxed max-w-4xl">
                    We pair adaptive sequencing with continuous dual-feedback loops
                    between learners and instructors so content, assessment, and support
                    evolve together. Every credential is cryptographically bound to
                    verifiable evidence, enabling learners to present tamper-proof
                    proof-of-skill to employers and collaborators.
                  </p>

                </div>

                {/* Tabs */}
                <div className="border-t border-neutral-200 pt-10">

                  <div className="flex flex-wrap gap-3 mb-8">
                    {paradigmTabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${activeTab === tab.id
                          ? 'bg-black text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="max-w-3xl text-lg text-neutral-700 leading-relaxed">
                    {paradigmTabs.find(t => t.id === activeTab)?.content}
                  </div>

                </div>

                {/* Bottom Panel */}
                <div className="border-t border-neutral-200 pt-10">

                  <div className="bg-neutral-50 rounded-3xl p-8 md:p-10 border border-neutral-200">

                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-3 h-3 rounded-full bg-black animate-pulse" />

                      <span className="text-xs font-black uppercase tracking-[0.25em] text-neutral-500">
                        Autonomous Flow
                      </span>
                    </div>

                    <p className="text-base text-neutral-700 leading-relaxed max-w-4xl">
                      Every account receives a tailored dashboard with contextual
                      learning suggestions, secure recovery systems, and cryptographic
                      signatures for issued credentials. Role-based controls and
                      immutable audit trails keep learner data private while allowing
                      educators and partners to verify outcomes without exposing
                      sensitive information.
                    </p>

                  </div>

                </div>

              </div>

            </Card>
          </motion.div>
        </section>

        {/* Features */}
        <section className="space-y-12">

          <div className="text-center space-y-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">
              Architecture
            </span>

            <h2 className="text-3xl font-bold tracking-tight text-black">
              Engineered Pillars
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: (index % 2) * 0.15 }}
              >
                <Card className="p-8 bg-white border-none shadow-sm hover:shadow-ambient hover:scale-[1.01] transition-all duration-300 flex items-start space-x-6 h-full">

                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex-shrink-0">
                    {feature.icon}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-black tracking-tight">
                      {feature.title}
                    </h3>

                    <p className="text-xs text-neutral-700 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                </Card>
              </motion.div>
            ))}
          </div>

        </section>

        {/* CTA */}
        {!user && (
          <section>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-12 text-center bg-black text-white border-none shadow-xl flex flex-col items-center space-y-6">

                <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">
                  Begin Your Journey
                </span>

                <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">
                  Ready to Build Something Extraordinary?
                </h2>

                <p className="text-sm text-neutral-400 max-w-xl leading-relaxed">
                  Join engineers, creators, and analysts building the future through
                  focused, project-driven learning.
                </p>

              </Card>
            </motion.div>
          </section>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;