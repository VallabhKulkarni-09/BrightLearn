import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  isEnrolled?: boolean;
  onEnroll?: (id: number) => void;
  isLoading?: boolean;
  onClick?: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, isEnrolled, onEnroll, isLoading, onClick }) => (
  <Card 
    onClick={onClick}
    className="flex flex-col h-full group border border-transparent hover:border-black hover:animate-blink transition-all duration-300 cursor-pointer"
  >
    <div className="h-40 bg-zinc-50 relative overflow-hidden flex items-center justify-center border-b border-black/5">
      {course.thumbnailUrl ? (
        <img 
          src={course.thumbnailUrl} 
          alt={course.title} 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <>
          {/* Background patterns */}
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(0,0,0,0.03),transparent)]" />
          
          {/* Symbol */}
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="relative z-10 w-12 h-12 rounded-2xl bg-white shadow-ambient flex items-center justify-center text-neutral-300 group-hover:text-black transition-colors duration-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </motion.div>
        </>
      )}
    </div>

    <div className="p-8 flex flex-col flex-1">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-black tracking-tighter line-clamp-1">{course.title}</h3>
      </div>
      <p className="text-neutral-400 text-sm mb-8 line-clamp-3 leading-relaxed flex-1">
        {course.description}
      </p>

      <div className="flex items-center justify-between mt-auto pt-6 border-t border-black/5">
        <div className="flex flex-col">
          <span className="text-[9px] text-neutral-300 uppercase tracking-[0.2em] font-black mb-1">Instructor</span>
          <span className="text-xs font-bold text-black">@{course.instructorUsername}</span>
        </div>

        {isEnrolled ? (
          <span className="text-[10px] font-black text-black uppercase tracking-widest bg-zinc-100 px-4 py-2 rounded-lg border border-black/5">
            Joined
          </span>
        ) : (
          <Button 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onEnroll?.(course.id);
            }} 
            isLoading={isLoading}
          >
            Enroll
          </Button>
        )}
      </div>
    </div>
  </Card>
);
