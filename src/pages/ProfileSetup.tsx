import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Activity,
  Pill,
  Moon,
  Coffee,
  Heart,
  Target,
  CheckCircle2,
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Health Conditions', icon: Heart },
  { id: 2, title: 'Blood Biomarkers', icon: Activity },
  { id: 3, title: 'Lifestyle', icon: Coffee },
  { id: 4, title: 'Sleep & Stress', icon: Moon },
  { id: 5, title: 'Fasting', icon: Target },
  { id: 6, title: 'Medications', icon: Pill },
  { id: 7, title: 'Supplements', icon: Sparkles },
  { id: 8, title: 'Focus Areas', icon: Target },
];

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [conditions, setConditions] = useState<string[]>([]);
  const [conditionNotes, setConditionNotes] = useState('');

  const [biomarkers, setBiomarkers] = useState({
    glucose: '',
    iron: '',
    vitamin_d: '',
    potassium: '',
    magnesium: '',
    hemoglobin: '',
    ldl_cholesterol: '',
    hdl_cholesterol: '',
    test_date: '',
  });

  const [lifestyle, setLifestyle] = useState({
    sleep_hours: '',
    stress_level: '',
    water_intake: 8,
    smokes: false,
    alcohol: false,
    caffeine_intake: '',
  });

  const [fasting, setFasting] = useState({
    enabled: false,
    method: '',
    eating_window_start: '',
    eating_window_end: '',
  });

  const [medications, setMedications] = useState<any[]>([]);
  const [supplements, setSupplements] = useState<any[]>([]);
  const [focusAreas, setFocusAreas] = useState<string[]>([]);

  const commonConditions = [
    'Diabetes', 'Hypertension', 'High Cholesterol', 'Thyroid Issues',
    'PCOS', 'IBS', 'Anxiety', 'Depression', 'Anemia', 'Asthma'
  ];

  const focusOptions = [
    'Weight Loss', 'Muscle Gain', 'Better Sleep', 'Stress Management',
    'Energy Boost', 'Heart Health', 'Gut Health', 'Mental Clarity'
  ];

  async function handleSave() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Save conditions
      if (conditions.length > 0) {
        await Promise.all(
          conditions.map(condition =>
            supabase.from('user_conditions').upsert({
              user_id: user.id,
              condition_type: condition,
              notes: conditionNotes,
            })
          )
        );
      }

      // Save biomarkers
      if (Object.values(biomarkers).some(v => v !== '' && v !== biomarkers.test_date)) {
        const biomarkerEntries = [
          { name: 'Glucose', value: biomarkers.glucose, unit: 'mg/dL' },
          { name: 'Iron', value: biomarkers.iron, unit: 'µg/dL' },
          { name: 'Vitamin D', value: biomarkers.vitamin_d, unit: 'ng/mL' },
          { name: 'Potassium', value: biomarkers.potassium, unit: 'mmol/L' },
          { name: 'Magnesium', value: biomarkers.magnesium, unit: 'mg/dL' },
          { name: 'Hemoglobin', value: biomarkers.hemoglobin, unit: 'g/dL' },
          { name: 'LDL Cholesterol', value: biomarkers.ldl_cholesterol, unit: 'mg/dL' },
          { name: 'HDL Cholesterol', value: biomarkers.hdl_cholesterol, unit: 'mg/dL' },
        ].filter(entry => entry.value && entry.value !== '');

        await Promise.all(
          biomarkerEntries.map(entry =>
            supabase.from('user_biomarkers').upsert({
              user_id: user.id,
              biomarker_name: entry.name,
              biomarker_value: parseFloat(entry.value),
              unit: entry.unit,
              test_date: biomarkers.test_date || null,
            }, {
              onConflict: 'user_id,biomarker_name'
            })
          )
        );
      }

      // Save lifestyle
      await supabase.from('user_lifestyle').upsert({
        user_id: user.id,
        ...lifestyle,
      });

      // Save fasting
      await supabase.from('user_fasting').upsert({
        user_id: user.id,
        fasting_enabled: fasting.enabled,
        fasting_method: fasting.method,
        eating_window_start: fasting.eating_window_start || null,
        eating_window_end: fasting.eating_window_end || null,
      });

      // Save medications and supplements
      const allMeds = [
        ...medications.map(m => ({ ...m, type: 'medication' })),
        ...supplements.map(s => ({ ...s, type: 'supplement' })),
      ];

      if (allMeds.length > 0) {
        await Promise.all(
          allMeds.map(med =>
            supabase.from('user_meds').insert({
              user_id: user.id,
              ...med,
            })
          )
        );
      }

      // Save settings
      await supabase.from('user_settings').upsert({
        user_id: user.id,
        focus_areas: focusAreas,
      });

      // Mark profile as complete
      await supabase
        .from('profiles')
        .update({ profile_completed: true })
        .eq('id', user.id);

      toast({
        title: '🎉 Profile Complete!',
        description: 'Your health profile has been saved successfully.',
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => currentStep === 1 ? navigate('/dashboard') : setCurrentStep(currentStep - 1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Complete Your Health Profile</h1>
              <p className="text-muted-foreground">
                Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
              </p>
            </div>
          </div>

          <Progress value={progress} className="h-2" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardContent className="p-8">
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Do you have any health conditions?</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {commonConditions.map((condition) => (
                          <div key={condition} className="flex items-center space-x-2">
                            <Checkbox
                              checked={conditions.includes(condition)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setConditions([...conditions, condition]);
                                } else {
                                  setConditions(conditions.filter(c => c !== condition));
                                }
                              }}
                            />
                            <label className="text-sm">{condition}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Additional Notes</Label>
                      <Textarea
                        value={conditionNotes}
                        onChange={(e) => setConditionNotes(e.target.value)}
                        placeholder="Any other conditions or details..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Recent Blood Test Results (Optional)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Glucose (mg/dL)</Label>
                        <Input
                          type="number"
                          value={biomarkers.glucose}
                          onChange={(e) => setBiomarkers({ ...biomarkers, glucose: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Iron (µg/dL)</Label>
                        <Input
                          type="number"
                          value={biomarkers.iron}
                          onChange={(e) => setBiomarkers({ ...biomarkers, iron: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Vitamin D (ng/mL)</Label>
                        <Input
                          type="number"
                          value={biomarkers.vitamin_d}
                          onChange={(e) => setBiomarkers({ ...biomarkers, vitamin_d: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Hemoglobin (g/dL)</Label>
                        <Input
                          type="number"
                          value={biomarkers.hemoglobin}
                          onChange={(e) => setBiomarkers({ ...biomarkers, hemoglobin: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>LDL Cholesterol (mg/dL)</Label>
                        <Input
                          type="number"
                          value={biomarkers.ldl_cholesterol}
                          onChange={(e) => setBiomarkers({ ...biomarkers, ldl_cholesterol: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>HDL Cholesterol (mg/dL)</Label>
                        <Input
                          type="number"
                          value={biomarkers.hdl_cholesterol}
                          onChange={(e) => setBiomarkers({ ...biomarkers, hdl_cholesterol: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Test Date</Label>
                      <Input
                        type="date"
                        value={biomarkers.test_date}
                        onChange={(e) => setBiomarkers({ ...biomarkers, test_date: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Lifestyle Information</h3>
                    <div>
                      <Label>Daily Water Intake (glasses)</Label>
                      <Input
                        type="number"
                        value={lifestyle.water_intake}
                        onChange={(e) => setLifestyle({ ...lifestyle, water_intake: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Caffeine Intake</Label>
                      <Input
                        placeholder="e.g., 2 cups of coffee daily"
                        value={lifestyle.caffeine_intake}
                        onChange={(e) => setLifestyle({ ...lifestyle, caffeine_intake: e.target.value })}
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={lifestyle.smokes}
                          onCheckedChange={(checked) => setLifestyle({ ...lifestyle, smokes: !!checked })}
                        />
                        <label>I smoke</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={lifestyle.alcohol}
                          onCheckedChange={(checked) => setLifestyle({ ...lifestyle, alcohol: !!checked })}
                        />
                        <label>I drink alcohol regularly</label>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Sleep & Stress</h3>
                    <div>
                      <Label>Average Sleep Hours</Label>
                      <Input
                        placeholder="e.g., 7-8 hours"
                        value={lifestyle.sleep_hours}
                        onChange={(e) => setLifestyle({ ...lifestyle, sleep_hours: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Stress Level</Label>
                      <Input
                        placeholder="e.g., Low, Moderate, High"
                        value={lifestyle.stress_level}
                        onChange={(e) => setLifestyle({ ...lifestyle, stress_level: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Intermittent Fasting</h3>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={fasting.enabled}
                        onCheckedChange={(checked) => setFasting({ ...fasting, enabled: !!checked })}
                      />
                      <label>I practice intermittent fasting</label>
                    </div>
                    {fasting.enabled && (
                      <>
                        <div>
                          <Label>Fasting Method</Label>
                          <Input
                            placeholder="e.g., 16:8, 18:6, OMAD"
                            value={fasting.method}
                            onChange={(e) => setFasting({ ...fasting, method: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Eating Window Start</Label>
                            <Input
                              type="time"
                              value={fasting.eating_window_start}
                              onChange={(e) => setFasting({ ...fasting, eating_window_start: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Eating Window End</Label>
                            <Input
                              type="time"
                              value={fasting.eating_window_end}
                              onChange={(e) => setFasting({ ...fasting, eating_window_end: e.target.value })}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {currentStep === 6 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Current Medications</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Skip this step if you're not taking any medications
                    </p>
                    {medications.map((med, idx) => (
                      <div key={idx} className="p-4 border rounded-lg space-y-3">
                        <Input
                          placeholder="Medication name"
                          value={med.name}
                          onChange={(e) => {
                            const newMeds = [...medications];
                            newMeds[idx].name = e.target.value;
                            setMedications(newMeds);
                          }}
                        />
                        <Input
                          placeholder="Dosage (e.g., 500mg)"
                          value={med.dosage}
                          onChange={(e) => {
                            const newMeds = [...medications];
                            newMeds[idx].dosage = e.target.value;
                            setMedications(newMeds);
                          }}
                        />
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => setMedications([...medications, { name: '', dosage: '' }])}
                    >
                      Add Medication
                    </Button>
                  </div>
                )}

                {currentStep === 7 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Supplements</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Skip this step if you're not taking any supplements
                    </p>
                    {supplements.map((sup, idx) => (
                      <div key={idx} className="p-4 border rounded-lg space-y-3">
                        <Input
                          placeholder="Supplement name"
                          value={sup.name}
                          onChange={(e) => {
                            const newSups = [...supplements];
                            newSups[idx].name = e.target.value;
                            setSupplements(newSups);
                          }}
                        />
                        <Input
                          placeholder="Dosage (e.g., 1000 IU)"
                          value={sup.dosage}
                          onChange={(e) => {
                            const newSups = [...supplements];
                            newSups[idx].dosage = e.target.value;
                            setSupplements(newSups);
                          }}
                        />
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => setSupplements([...supplements, { name: '', dosage: '' }])}
                    >
                      Add Supplement
                    </Button>
                  </div>
                )}

                {currentStep === 8 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold mb-4">What are your main health goals?</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {focusOptions.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox
                            checked={focusAreas.includes(option)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFocusAreas([...focusAreas, option]);
                              } else {
                                setFocusAreas(focusAreas.filter(f => f !== option));
                              }
                            }}
                          />
                          <label className="text-sm">{option}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  {currentStep < STEPS.length ? (
                    <Button onClick={() => setCurrentStep(currentStep + 1)}>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-500 to-purple-500"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Complete Setup
                    </Button>
                  )}
                </div>

                <div className="mt-6 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                  >
                    Skip for now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
