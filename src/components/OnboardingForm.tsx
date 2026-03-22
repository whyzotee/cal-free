import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../lib/supabase';

const onboardingSchema = z.object({
  age: z.number().min(1).max(120),
  gender: z.enum(['male', 'female', 'other']),
  weight: z.number().min(20).max(500),
  height: z.number().min(50).max(300),
  activity_level: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active']),
});

type OnboardingData = z.infer<typeof onboardingSchema>;

const activityFactors = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

export const OnboardingForm: React.FC<{ onComplete: (tdee: number) => void }> = ({ onComplete }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
  });

  const onSubmit = async (data: OnboardingData) => {
    // Mifflin-St Jeor Equation
    let bmr = (10 * data.weight) + (6.25 * data.height) - (5 * data.age);
    if (data.gender === 'male') {
      bmr += 5;
    } else if (data.gender === 'female') {
      bmr -= 161;
    } else {
      bmr -= 78; // Neutral average
    }

    const tdee = Math.round(bmr * activityFactors[data.activity_level]);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      age: data.age,
      gender: data.gender,
      weight: data.weight,
      height: data.height,
      activity_level: data.activity_level,
      tdee: tdee,
    });

    if (error) {
      alert('Error saving profile: ' + error.message);
    } else {
      onComplete(tdee);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md space-y-4 text-gray-900">
      <h2 className="text-2xl font-bold text-center">Personal Onboarding</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Age</label>
          <input type="number" {...register('age', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" />
          {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Gender</label>
          <select {...register('gender')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500">
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Weight (kg)</label>
          <input type="number" step="0.1" {...register('weight', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" />
          {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Height (cm)</label>
          <input type="number" {...register('height', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" />
          {errors.height && <p className="text-red-500 text-xs mt-1">{errors.height.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Activity Level</label>
          <select {...register('activity_level')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500">
            <option value="sedentary">Sedentary (Little/no exercise)</option>
            <option value="lightly_active">Lightly Active (1-3 days/week)</option>
            <option value="moderately_active">Moderately Active (3-5 days/week)</option>
            <option value="very_active">Very Active (6-7 days/week)</option>
            <option value="extra_active">Extra Active (Very hard exercise/physical job)</option>
          </select>
          {errors.activity_level && <p className="text-red-500 text-xs mt-1">{errors.activity_level.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50">
          {isSubmitting ? 'Saving...' : 'Calculate & Save'}
        </button>
      </form>
    </div>
  );
};
