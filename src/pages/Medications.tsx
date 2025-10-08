import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Pill, ArrowLeft, Edit, Trash2, CheckCircle2, Clock, AlertCircle, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  take_with_food: boolean;
  pills_per_bottle?: number;
  current_pills?: number;
  notes?: string;
  is_active: boolean;
}

interface MedicationLog {
  id: string;
  medication_id: string;
  scheduled_time: string;
  taken_at?: string;
  skipped: boolean;
}

export default function Medications() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | undefined>();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);

  const today = new Date().toISOString().split('T')[0];

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'Daily',
    times: ['08:00'],
    take_with_food: false,
    pills_per_bottle: '',
    current_pills: '',
    notes: ''
  });

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUserId(user.id);
      await fetchData(user.id);
    }
    init();
  }, [navigate]);

  async function fetchData(uid: string) {
    try {
      setLoading(true);

      // Fetch medications
      const { data: medsData, error: medsError } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', uid)
        .order('name', { ascending: true });

      if (medsError) throw medsError;
      setMedications(medsData || []);

      // Fetch last 7 days of logs for adherence calculation
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: logsData, error: logsError } = await supabase
        .from('medication_logs')
        .select('*')
        .eq('user_id', uid)
        .gte('scheduled_time', sevenDaysAgo.toISOString());

      if (logsError) throw logsError;
      setMedicationLogs(logsData || []);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error loading medications",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      frequency: 'Daily',
      times: ['08:00'],
      take_with_food: false,
      pills_per_bottle: '',
      current_pills: '',
      notes: ''
    });
    setEditingMed(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      const medData = {
        user_id: userId,
        name: formData.name,
        dosage: formData.dosage,
        frequency: formData.frequency,
        times: formData.times,
        take_with_food: formData.take_with_food,
        pills_per_bottle: formData.pills_per_bottle ? parseInt(formData.pills_per_bottle) : null,
        current_pills: formData.current_pills ? parseInt(formData.current_pills) : null,
        notes: formData.notes || null,
        is_active: true
      };

      if (editingMed) {
        const { error } = await supabase
          .from('medications')
          .update(medData)
          .eq('id', editingMed.id);

        if (error) throw error;

        toast({
          title: "Medication updated",
          description: `${formData.name} has been updated`
        });
      } else {
        const { error } = await supabase
          .from('medications')
          .insert(medData);

        if (error) throw error;

        toast({
          title: "Medication added",
          description: `${formData.name} has been added to your list`
        });
      }

      await fetchData(userId);
      setDialogOpen(false);
      resetForm();

    } catch (error: any) {
      console.error('Error saving medication:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (med: Medication) => {
    setEditingMed(med);
    setFormData({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      times: med.times,
      take_with_food: med.take_with_food,
      pills_per_bottle: med.pills_per_bottle?.toString() || '',
      current_pills: med.current_pills?.toString() || '',
      notes: med.notes || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This will also remove all associated logs.`)) return;

    try {
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Medication deleted",
        description: `${name} has been removed`
      });

      await fetchData(userId!);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleToggleActive = async (id: string, name: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('medications')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: `Medication ${!currentStatus ? 'activated' : 'deactivated'}`,
        description: name
      });

      await fetchData(userId!);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const addTimeSlot = () => {
    setFormData({
      ...formData,
      times: [...formData.times, '12:00']
    });
  };

  const removeTimeSlot = (index: number) => {
    setFormData({
      ...formData,
      times: formData.times.filter((_, i) => i !== index)
    });
  };

  const updateTimeSlot = (index: number, value: string) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData({ ...formData, times: newTimes });
  };

  // Calculate adherence
  const calculateAdherence = (medId: string) => {
    const medLogs = medicationLogs.filter(log => log.medication_id === medId);
    if (medLogs.length === 0) return 100;

    const taken = medLogs.filter(log => log.taken_at && !log.skipped).length;
    return Math.round((taken / medLogs.length) * 100);
  };

  const activeMeds = medications.filter(m => m.is_active);
  const inactiveMeds = medications.filter(m => !m.is_active);

  // Overall adherence
  const overallAdherence = medications.length > 0
    ? Math.round(medications.reduce((sum, med) => sum + calculateAdherence(med.id), 0) / medications.length)
    : 100;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Pill className="w-12 h-12 animate-pulse mx-auto mb-4 text-primary" />
          <p>Loading medications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Medications</h1>
              <p className="text-sm text-muted-foreground">
                Manage your medication schedule
              </p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Medication
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingMed ? 'Edit Medication' : 'Add Medication'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="name">Medication Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Metformin"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="dosage">Dosage *</Label>
                  <Input
                    id="dosage"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="e.g., 500mg or 1 tablet"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Daily">Daily</SelectItem>
                      <SelectItem value="Twice daily">Twice daily</SelectItem>
                      <SelectItem value="Three times daily">Three times daily</SelectItem>
                      <SelectItem value="As needed">As needed</SelectItem>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Times *</Label>
                  <div className="space-y-2">
                    {formData.times.map((time, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          type="time"
                          value={time}
                          onChange={(e) => updateTimeSlot(index, e.target.value)}
                          required
                        />
                        {formData.times.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeTimeSlot(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTimeSlot}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Time
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="take_with_food">Take with food</Label>
                  <Switch
                    id="take_with_food"
                    checked={formData.take_with_food}
                    onCheckedChange={(checked) => setFormData({ ...formData, take_with_food: checked })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pills_per_bottle">Pills per bottle</Label>
                    <Input
                      id="pills_per_bottle"
                      type="number"
                      value={formData.pills_per_bottle}
                      onChange={(e) => setFormData({ ...formData, pills_per_bottle: e.target.value })}
                      placeholder="e.g., 30"
                    />
                  </div>
                  <div>
                    <Label htmlFor="current_pills">Current pills</Label>
                    <Input
                      id="current_pills"
                      type="number"
                      value={formData.current_pills}
                      onChange={(e) => setFormData({ ...formData, current_pills: e.target.value })}
                      placeholder="e.g., 15"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any special instructions..."
                    rows={2}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingMed ? 'Update' : 'Add Medication'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Overall Adherence Card */}
        {activeMeds.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                7-Day Adherence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Overall Adherence</span>
                  <span className="text-3xl font-bold">{overallAdherence}%</span>
                </div>
                <Progress value={overallAdherence} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  {overallAdherence >= 80 ? '✅ Great job staying on track!' : '⚠️ Try to improve your adherence'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Medications */}
        <div className="space-y-4 mb-6">
          <h2 className="text-lg font-semibold">Active Medications</h2>
          {activeMeds.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Pill className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-2">No active medications</p>
                <p className="text-sm text-muted-foreground">Add your first medication to get started</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeMeds.map(med => {
                const adherence = calculateAdherence(med.id);
                const daysRemaining = med.current_pills && med.times.length > 0
                  ? Math.floor(med.current_pills / med.times.length)
                  : null;

                return (
                  <Card key={med.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{med.name}</h3>
                            {med.take_with_food && (
                              <Badge variant="outline" className="text-xs">With food</Badge>
                            )}
                            <Badge variant={adherence >= 80 ? 'default' : 'destructive'}>
                              {adherence}% adherence
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>Dosage: {med.dosage}</p>
                            <p>Frequency: {med.frequency}</p>
                            <p>Times: {med.times.join(', ')}</p>
                            {med.notes && <p className="italic">"{med.notes}"</p>}
                            {daysRemaining !== null && (
                              <p className={daysRemaining <= 7 ? 'text-orange-600 font-medium' : ''}>
                                {daysRemaining <= 0 ? '⚠️ Refill needed!' : `💊 ${daysRemaining} days remaining`}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(med)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(med.id, med.name, med.is_active)}
                          >
                            <Clock className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(med.id, med.name)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Inactive Medications */}
        {inactiveMeds.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-muted-foreground">Inactive Medications</h2>
            <div className="space-y-3">
              {inactiveMeds.map(med => (
                <Card key={med.id} className="opacity-60">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{med.name}</h3>
                        <p className="text-sm text-muted-foreground">{med.dosage}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(med.id, med.name, med.is_active)}
                        >
                          Reactivate
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(med.id, med.name)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
