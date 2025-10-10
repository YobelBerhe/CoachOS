import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Users,
  Plus,
  Copy,
  Crown,
  UserPlus,
  ShoppingCart,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

interface FamilyGroup {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  member_count: number;
}

interface FamilyMember {
  id: string;
  user_id: string;
  role: string;
  email: string;
  full_name: string;
  joined_at: string;
}

interface Invite {
  id: string;
  invited_email: string;
  invite_code: string;
  status: string;
  expires_at: string;
}

export default function FamilySharing() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [familyGroup, setFamilyGroup] = useState<FamilyGroup | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    loadFamilyGroup();
  }, []);

  async function loadFamilyGroup() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      const { data: membership } = await supabase
        .from('family_members')
        .select('group_id, role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (membership) {
        const { data: group } = await supabase
          .from('family_groups')
          .select('*')
          .eq('id', membership.group_id)
          .single();

        if (group) {
          const { count } = await supabase
            .from('family_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          setFamilyGroup({
            ...group,
            member_count: count || 0
          });

          await loadMembers(group.id);
          await loadInvites(group.id);
        }
      }
    } catch (error) {
      console.error('Error loading family group:', error);
    }
  }

  async function loadMembers(groupId: string) {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select(`
          id,
          user_id,
          role,
          joined_at,
          profiles!inner(email, full_name)
        `)
        .eq('group_id', groupId);

      if (error) throw error;

      const formattedMembers = data.map((m: any) => ({
        id: m.id,
        user_id: m.user_id,
        role: m.role,
        email: m.profiles.email,
        full_name: m.profiles.full_name || 'Unknown',
        joined_at: m.joined_at
      }));

      setMembers(formattedMembers);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  }

  async function loadInvites(groupId: string) {
    try {
      const { data, error } = await supabase
        .from('family_invites')
        .select('*')
        .eq('group_id', groupId)
        .eq('status', 'pending');

      if (error) throw error;
      setInvites(data || []);
    } catch (error) {
      console.error('Error loading invites:', error);
    }
  }

  async function createFamilyGroup() {
    if (!groupName.trim()) return;
    
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: group, error: groupError } = await supabase
        .from('family_groups')
        .insert({
          name: groupName,
          created_by: user.id
        } as any)
        .select()
        .single();

      if (groupError) throw groupError;

      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: 'admin'
        } as any);

      if (memberError) throw memberError;

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast({
        title: "Family group created! 🎉",
        description: `${groupName} is ready to share`
      });

      setShowCreateDialog(false);
      setGroupName('');
      await loadFamilyGroup();
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error creating group",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function inviteMember() {
    if (!inviteEmail.trim() || !familyGroup) return;

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase
        .from('family_invites')
        .insert({
          group_id: familyGroup.id,
          invited_email: inviteEmail,
          invited_by: user.id,
          invite_code: inviteCode,
          expires_at: expiresAt.toISOString()
        } as any);

      if (error) throw error;

      toast({
        title: "Invite sent! 📧",
        description: `Invitation code: ${inviteCode}`
      });

      setShowInviteDialog(false);
      setInviteEmail('');
      await loadInvites(familyGroup.id);
    } catch (error) {
      console.error('Error inviting member:', error);
      toast({
        title: "Error sending invite",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  function copyInviteCode(code: string) {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code copied! 📋",
      description: "Share this code with your family"
    });
  }

  function getInitials(name: string) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  const userMember = members.find(m => m.user_id === currentUserId);
  const isAdmin = userMember?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-pink-500/5 to-background">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/shopping-list')}
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Users className="w-6 h-6 text-pink-500" />
                  Family Sharing
                </h1>
                <p className="text-sm text-muted-foreground">
                  Shop together with your family
                </p>
              </div>
            </div>

            {familyGroup && isAdmin && (
              <Button
                onClick={() => setShowInviteDialog(true)}
                className="gap-2 bg-gradient-to-r from-pink-500 to-rose-500"
              >
                <UserPlus className="w-4 h-4" />
                Invite Member
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {!familyGroup ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-6">
              <Users className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Create Your Family Group</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Share shopping lists with family members and shop together in real-time
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              {[
                { icon: ShoppingCart, title: 'Shared Lists', desc: 'Everyone sees the same list' },
                { icon: CheckCircle2, title: 'Real-time Sync', desc: 'Updates instantly' },
                { icon: Sparkles, title: 'Collaborate', desc: 'Shop together efficiently' }
              ].map((feature, idx) => (
                <Card key={idx} className="border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <feature.icon className="w-10 h-10 mx-auto mb-3 text-pink-500" />
                    <h3 className="font-bold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              size="lg"
              onClick={() => setShowCreateDialog(true)}
              className="gap-2 bg-gradient-to-r from-pink-500 to-rose-500"
            >
              <Plus className="w-5 h-5" />
              Create Family Group
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-0 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-rose-500/10" />
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{familyGroup.name}</h2>
                      <p className="text-muted-foreground mb-4">
                        {familyGroup.member_count} {familyGroup.member_count === 1 ? 'member' : 'members'}
                      </p>
                      <Badge className="bg-pink-500">
                        {isAdmin ? '👑 Admin' : 'Member'}
                      </Badge>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="font-semibold">
                        {new Date(familyGroup.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">Family Members</h3>
                  <div className="space-y-3">
                    {members.map((member, idx) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-4 p-4 rounded-lg bg-secondary"
                      >
                        <Avatar className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500">
                          <AvatarFallback className="text-white font-bold">
                            {getInitials(member.full_name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{member.full_name}</p>
                            {member.role === 'admin' && (
                              <Crown className="w-4 h-4 text-yellow-500" />
                            )}
                            {member.user_id === currentUserId && (
                              <Badge variant="secondary" className="text-xs">You</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>

                        <div className="text-right text-xs text-muted-foreground">
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {isAdmin && invites.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4">Pending Invites</h3>
                    <div className="space-y-3">
                      {invites.map((invite) => (
                        <div
                          key={invite.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-secondary"
                        >
                          <div>
                            <p className="font-semibold">{invite.invited_email}</p>
                            <p className="text-sm text-muted-foreground">
                              Code: <span className="font-mono font-bold">{invite.invite_code}</span>
                            </p>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyInviteCode(invite.invite_code)}
                            className="gap-2"
                          >
                            <Copy className="w-3 h-3" />
                            Copy Code
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">Shared Shopping Lists</h3>
                    <Button
                      onClick={() => navigate('/shopping-list')}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      View Lists
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    All family members can view and edit shared shopping lists in real-time
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Family Group</DialogTitle>
            <DialogDescription>
              Give your family group a name
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Input
                placeholder="e.g., Smith Family"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    createFamilyGroup();
                  }
                }}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={createFamilyGroup}
                disabled={!groupName.trim() || isLoading}
                className="flex-1"
              >
                {isLoading ? 'Creating...' : 'Create Group'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Family Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your family group
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="family@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    inviteMember();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground mt-2">
                They'll receive an invitation code to join
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowInviteDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={inviteMember}
                disabled={!inviteEmail.trim() || isLoading}
                className="flex-1"
              >
                {isLoading ? 'Sending...' : 'Send Invite'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
