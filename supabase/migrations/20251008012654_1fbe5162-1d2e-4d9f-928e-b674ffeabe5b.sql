-- Create medications table
CREATE TABLE public.medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  times JSONB NOT NULL DEFAULT '[]'::jsonb,
  take_with_food BOOLEAN DEFAULT false,
  pills_per_bottle INTEGER,
  current_pills INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create medication_logs table
CREATE TABLE public.medication_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  taken_at TIMESTAMP WITH TIME ZONE,
  skipped BOOLEAN DEFAULT false,
  skip_reason TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;

-- Policies for medications
CREATE POLICY "Users can manage own medications"
ON public.medications
FOR ALL
USING (user_id = auth.uid());

-- Policies for medication_logs
CREATE POLICY "Users can manage own medication logs"
ON public.medication_logs
FOR ALL
USING (user_id = auth.uid());

-- Trigger for medications updated_at
CREATE TRIGGER update_medications_updated_at
BEFORE UPDATE ON public.medications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_medications_user_id ON public.medications(user_id);
CREATE INDEX idx_medications_user_active ON public.medications(user_id, is_active);
CREATE INDEX idx_medication_logs_user_date ON public.medication_logs(user_id, date);
CREATE INDEX idx_medication_logs_medication_id ON public.medication_logs(medication_id);