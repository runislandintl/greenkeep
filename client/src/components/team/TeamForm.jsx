import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import api from '@/config/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, X, Plus } from 'lucide-react';

export default function TeamForm({ initialData, onSubmit, isPending }) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    userId: initialData?.userId || '',
    position: initialData?.position || '',
    phone: initialData?.phone || '',
    skills: initialData?.skills || [],
    certifications: initialData?.certifications || [],
  });

  const [skillInput, setSkillInput] = useState('');
  const [certInput, setCertInput] = useState('');

  // Fetch users for the dropdown
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then((r) => r.data),
  });

  const users = usersData?.data || usersData || [];

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const addCertification = () => {
    const trimmed = certInput.trim();
    if (trimmed && !formData.certifications.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        certifications: [...prev.certifications, trimmed],
      }));
      setCertInput('');
    }
  };

  const removeCertification = (cert) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((c) => c !== cert),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleCertKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCertification();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {initialData ? t('team.editMember') : t('team.addMember')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User select */}
          <div className="space-y-2">
            <label htmlFor="team-user" className="text-sm font-medium">
              {t('team.user')}
            </label>
            <select
              id="team-user"
              value={formData.userId}
              onChange={handleChange('userId')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
              disabled={!!initialData}
            >
              <option value="">{t('team.selectUser')}</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {/* Position */}
          <div className="space-y-2">
            <label htmlFor="team-position" className="text-sm font-medium">
              {t('team.position')}
            </label>
            <Input
              id="team-position"
              value={formData.position}
              onChange={handleChange('position')}
              placeholder={t('team.positionPlaceholder')}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label htmlFor="team-phone" className="text-sm font-medium">
              {t('team.phone')}
            </label>
            <Input
              id="team-phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange('phone')}
              placeholder={t('team.phonePlaceholder')}
            />
          </div>

          {/* Skills (tag input) */}
          <div className="space-y-2">
            <label htmlFor="team-skill-input" className="text-sm font-medium">
              {t('team.skills')}
            </label>
            <div className="flex gap-2">
              <Input
                id="team-skill-input"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder={t('team.skillPlaceholder')}
              />
              <Button type="button" variant="outline" size="icon" onClick={addSkill} aria-label={t('team.addSkill')}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {formData.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                      aria-label={`${t('common.remove')} ${skill}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Certifications */}
          <div className="space-y-2">
            <label htmlFor="team-cert-input" className="text-sm font-medium">
              {t('team.certifications')}
            </label>
            <div className="flex gap-2">
              <Input
                id="team-cert-input"
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                onKeyDown={handleCertKeyDown}
                placeholder={t('team.certificationPlaceholder')}
              />
              <Button type="button" variant="outline" size="icon" onClick={addCertification} aria-label={t('team.addCertification')}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.certifications.length > 0 && (
              <ul className="mt-2 space-y-1">
                {formData.certifications.map((cert) => (
                  <li
                    key={cert}
                    className="flex items-center justify-between text-sm px-3 py-1.5 rounded-md bg-muted/50"
                  >
                    <span>{cert}</span>
                    <button
                      type="button"
                      onClick={() => removeCertification(cert)}
                      className="text-muted-foreground hover:text-destructive p-0.5"
                      aria-label={`${t('common.remove')} ${cert}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="submit" disabled={isPending || !formData.userId}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {initialData ? t('common.save') : t('team.addMember')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
