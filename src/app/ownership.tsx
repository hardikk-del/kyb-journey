import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, MapPin, Plus, Trash2, User, X } from 'lucide-react-native';

import { Body, BottomBar, PrimaryCTA, ScreenHeader } from '@/components/layout';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Txt } from '@/components/Txt';
import { Checkbox } from '@/components/kyb/controls';
import { ENTITY_META, membersInfoFor } from '@/lib/entities';
import { useStepHeader } from '@/lib/steps';
import { go } from '@/lib/nav';
import { C, shadowXs } from '@/lib/tokens';
import { cn } from '@/lib/cn';
import { useFlow } from '@/store/flow';

// Individuals holding more than this are Ultimate Beneficial Owners.
const UBO_THRESHOLD = 10;
const inputStyle = { fontFamily: 'DMSans_500Medium' as const };
const PH = 'rgb(141,141,141)';

interface Owner {
  id: string;
  name: string;
  dob: string;
  address: string;
  din: string;
  share: string;
  isDirector: boolean;
}

/* ---------------- entity detail row ---------------- */

function Detail({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View className={cn('flex-row items-start justify-between gap-4 py-3', last ? '' : 'border-b border-line')}>
      <Txt className="text-[13px] text-ink-3">{label}</Txt>
      <Txt weight={700} className="flex-1 text-right text-[13.5px] leading-[18px] text-ink">
        {value}
      </Txt>
    </View>
  );
}

/* ---------------- shareholding % input + UBO flag ---------------- */

function ShareRow({ share, onShare, isUbo, note }: { share: string; onShare: (v: string) => void; isUbo: boolean; note: number | null }) {
  return (
    <View className="gap-1.5 border-t border-line pt-3">
      <View className="flex-row items-center gap-2">
        <Txt weight={600} className="text-[13px] text-ink-2">
          Shareholding
        </Txt>
        {isUbo ? (
          <View className="h-5 flex-row items-center rounded-full bg-blue-50 px-2">
            <Txt weight={600} className="text-[10px] text-brand">
              Beneficial owner
            </Txt>
          </View>
        ) : null}
      </View>
      <View className={cn('h-11 flex-row items-center rounded-lg border px-3', share ? 'border-blue-500 bg-blue-50' : 'border-line-strong bg-card')}>
        <TextInput
          value={share}
          onChangeText={(t) => onShare(t.replace(/[^0-9]/g, '').slice(0, 3))}
          keyboardType="numeric"
          placeholder="Enter shareholding %"
          placeholderTextColor={PH}
          style={inputStyle}
          className="flex-1 text-[15px] text-ink"
        />
        <Txt weight={600} className="ml-1 text-[15px] text-ink-3">
          %
        </Txt>
      </View>
      {note != null ? (
        <Txt weight={500} className="text-[11px] text-amber-700">
          {note === 0 ? 'Shareholding is already fully allocated (100%)' : `Capped — only ${note}% left to allocate`}
        </Txt>
      ) : null}
    </View>
  );
}

/* ---------------- owner card ---------------- */

function OwnerCard({ owner, note, onShare, onRemove }: { owner: Owner; note: number | null; onShare: (v: string) => void; onRemove: () => void }) {
  const { name, dob, address, din, share, isDirector } = owner;
  const isUbo = (Number(share) || 0) > UBO_THRESHOLD;

  return (
    <View style={shadowXs} className={cn('gap-3 rounded-xl border bg-card p-3.5', isUbo ? 'border-blue-200' : 'border-line')}>
      {isDirector ? (
        <View className="flex-row items-start gap-2.5">
          <View className="h-9 w-9 items-center justify-center rounded-full bg-blue-50">
            <User size={18} color={C.brand} strokeWidth={2} />
          </View>
          <View className="flex-1 gap-1">
            <View className="flex-row items-start justify-between gap-2">
              <Txt weight={700} numberOfLines={1} className="flex-1 text-[14px] text-ink">
                {name}
              </Txt>
              {din ? (
                <Txt mono className="text-[11px] text-ink-3">
                  DIN {din}
                </Txt>
              ) : null}
            </View>
            {dob ? (
              <View className="flex-row items-center gap-1.5">
                <Calendar size={12} color={C.ink3} strokeWidth={2} />
                <Txt className="text-[12px] text-ink-3">DOB · {dob}</Txt>
              </View>
            ) : null}
            {address ? (
              <View className="flex-row items-start gap-1.5">
                <MapPin size={12} color={C.ink3} strokeWidth={2} style={{ marginTop: 2 }} />
                <Txt className="flex-1 text-[12px] leading-[16px] text-ink-3">{address}</Txt>
              </View>
            ) : null}
          </View>
        </View>
      ) : (
        <View className="flex-row items-start gap-2.5">
          <View className="h-9 w-9 items-center justify-center rounded-full bg-grey-100">
            <User size={18} color={C.ink3} strokeWidth={2} />
          </View>
          <View className="flex-1 gap-1">
            <View className="flex-row items-start justify-between gap-2">
              <Txt weight={700} numberOfLines={1} className="flex-1 text-[14px] text-ink">
                {name}
              </Txt>
              <Pressable onPress={onRemove} hitSlop={6} className="h-7 w-7 items-center justify-center rounded-lg border border-line active:bg-grey-50">
                <Trash2 size={14} color={C.neg} strokeWidth={2} />
              </Pressable>
            </View>
            {dob ? (
              <View className="flex-row items-center gap-1.5">
                <Calendar size={12} color={C.ink3} strokeWidth={2} />
                <Txt className="text-[12px] text-ink-3">DOB · {dob}</Txt>
              </View>
            ) : null}
            {address ? (
              <View className="flex-row items-start gap-1.5">
                <MapPin size={12} color={C.ink3} strokeWidth={2} style={{ marginTop: 2 }} />
                <Txt className="flex-1 text-[12px] leading-[16px] text-ink-3">{address}</Txt>
              </View>
            ) : null}
          </View>
        </View>
      )}

      <ShareRow share={share} onShare={onShare} isUbo={isUbo} note={note} />
    </View>
  );
}

/* ---------------- declaration row ---------------- */

function CheckRow({ checked, onToggle, children }: { checked: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <Pressable onPress={onToggle} className="flex-row items-start gap-3 px-1">
      <View className="mt-0.5">
        <Checkbox checked={checked} />
      </View>
      <Txt className="flex-1 text-[13px] leading-[18px] text-ink-2">{children}</Txt>
    </Pressable>
  );
}

/* ---------------- add shareholder modal ---------------- */

interface NewOwner {
  name: string;
  dob: string;
  address: string;
  share: string;
}

function AddShareholderModal({ left, onAdd, onClose }: { left: number; onAdd: (o: NewOwner) => void; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [share, setShare] = useState('');

  const shareNum = Number(share) || 0;
  const isUbo = shareNum > UBO_THRESHOLD;
  const canSave = name.trim().length > 0 && shareNum > 0;

  // Cap entry to whatever's left of 100% so the total can never exceed it.
  const onShareChange = (t: string) => {
    const digits = t.replace(/[^0-9]/g, '').slice(0, 3);
    setShare(digits === '' ? '' : String(Math.min(Number(digits), left)));
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/40" onPress={onClose} />
        <View style={{ maxHeight: '88%' }} className="rounded-t-2xl border-t border-line bg-page">
          <View className="flex-row items-start justify-between px-5 pt-5">
            <View className="flex-1">
              <Txt weight={700} className="text-[16px] tracking-[-0.2px] text-ink">
                Add shareholder
              </Txt>
              <Txt className="mt-0.5 text-[12px] text-ink-3">
                {left > 0 ? `${left}% of shareholding still to allocate` : 'Shareholding is fully allocated (100%)'}
              </Txt>
            </View>
            <Pressable onPress={onClose} hitSlop={8} className="h-8 w-8 items-center justify-center rounded-full active:bg-grey-100">
              <X size={20} color={C.ink2} strokeWidth={2} />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerClassName="px-5 pt-4"
            contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
          >
            <View className="gap-3.5">
              <Input label="Full name" required value={name} onChangeText={setName} placeholder="As per PAN / ID proof" autoFocus />
              <Input label="Date of birth" value={dob} onChangeText={setDob} placeholder="DD MMM YYYY" />
              <Input label="Residential address" value={address} onChangeText={setAddress} placeholder="Flat, street, city, PIN" />

              <View className="gap-1.5">
                <View className="flex-row items-center gap-2">
                  <Txt weight={600} className="text-[13px] text-ink">
                    Shareholding<Txt className="text-red-500"> *</Txt>
                  </Txt>
                  {isUbo ? (
                    <View className="h-5 flex-row items-center rounded-full bg-blue-50 px-2">
                      <Txt weight={600} className="text-[10px] text-brand">
                        Beneficial owner
                      </Txt>
                    </View>
                  ) : null}
                </View>
                <View className={cn('h-12 flex-row items-center rounded-lg border px-3', share ? 'border-blue-500 bg-blue-50' : 'border-line-strong bg-card')}>
                  <TextInput
                    value={share}
                    onChangeText={onShareChange}
                    keyboardType="numeric"
                    placeholder="Enter shareholding %"
                    placeholderTextColor={PH}
                    style={inputStyle}
                    className="flex-1 text-[15px] text-ink"
                  />
                  <Txt weight={600} className="ml-1 text-[15px] text-ink-3">
                    %
                  </Txt>
                </View>
              </View>
            </View>

            <View className="mt-5">
              <Button
                label="Add shareholder"
                fullWidth
                disabled={!canSave}
                onPress={() => {
                  onAdd({ name: name.trim(), dob: dob.trim(), address: address.trim(), share });
                  onClose();
                }}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ---------------- screen ---------------- */

export default function OwnershipScreen() {
  const flow = useFlow();
  const entity = flow.entity;
  const meta = ENTITY_META[entity];

  const entityName = meta?.legalName ?? 'Finramp Technologies Pvt Ltd';
  const regAddress = meta?.registeredOffice ?? 'Unit 4, Lotus Industrial Estate, Andheri East, Mumbai 400059';
  const doi = meta?.dateOfIncorporation ?? '14 Mar 2016';

  const [confirmEntity, setConfirmEntity] = useState(true);
  const [confirmOwnership, setConfirmOwnership] = useState(true);
  const [confirmPep, setConfirmPep] = useState(true);
  const [owners, setOwners] = useState<Owner[]>(() =>
    membersInfoFor(entity).map((m, i) => ({
      id: `d${i}`,
      name: m.name,
      dob: m.dob || '',
      address: m.address || '',
      din: m.din ?? '',
      share: '', // entered manually
      isDirector: true,
    })),
  );

  // Shows which owner's input got capped, and how much was left to allocate.
  const [capNote, setCapNote] = useState<{ id: string; left: number } | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const allocated = owners.reduce((sum, o) => sum + (Number(o.share) || 0), 0);
  const left = Math.max(0, 100 - allocated);

  const setOwner = (id: string, patch: Partial<Owner>) =>
    setOwners((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));

  // Clamp each entry to whatever's left of 100% across all the other owners, so
  // the combined shareholding can never exceed 100%.
  const setShare = (id: string, digits: string) => {
    const others = owners.reduce((sum, o) => (o.id === id ? sum : sum + (Number(o.share) || 0)), 0);
    const left = Math.max(0, 100 - others);
    const requested = Number(digits) || 0;
    const value = digits === '' ? '' : String(Math.min(requested, left));
    setOwner(id, { share: value });
    setCapNote(requested > left ? { id, left } : (prev) => (prev?.id === id ? null : prev));
  };

  const removeOwner = (id: string) => {
    setOwners((prev) => prev.filter((o) => o.id !== id));
    setCapNote((prev) => (prev?.id === id ? null : prev));
  };
  const addOwner = (o: NewOwner) =>
    setOwners((prev) => [
      ...prev,
      { id: `s${Date.now()}`, name: o.name, dob: o.dob, address: o.address, din: '', share: o.share, isDirector: false },
    ]);

  const complete = confirmEntity && confirmOwnership && confirmPep;

  return (
    <View className="flex-1 bg-page">
      <ScreenHeader {...useStepHeader('ownership')} title="Entity & ownership" />

      <Body className="gap-6">
        {/* Entity details */}
        <View className="gap-3">
          <Txt weight={700} className="text-[16px] tracking-[-0.2px] text-ink">
            Entity details
          </Txt>
          <View style={shadowXs} className="rounded-xl border border-line bg-card px-4 py-1">
            <Detail label="Entity name" value={entityName} />
            <Detail label="Registered address" value={regAddress} />
            <Detail label="Date of incorporation" value={doi} last />
          </View>
        </View>

        {/* Business ownership */}
        <View className="gap-3">
          <View>
            <Txt weight={700} className="text-[16px] tracking-[-0.2px] text-ink">
              Business ownership
            </Txt>
            <Txt className="mt-0.5 text-[12.5px] leading-[17px] text-ink-3">
              Enter each owner's shareholding. Add anyone holding more than {UBO_THRESHOLD}% who isn't already listed
            </Txt>
          </View>

          {owners.map((o) => (
            <OwnerCard
              key={o.id}
              owner={o}
              note={capNote?.id === o.id ? capNote.left : null}
              onShare={(digits) => setShare(o.id, digits)}
              onRemove={() => removeOwner(o.id)}
            />
          ))}

          <Pressable
            onPress={() => setShowAdd(true)}
            className="h-12 flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong bg-card active:bg-grey-50"
          >
            <Plus size={18} color={C.ink2} strokeWidth={2} />
            <Txt weight={600} className="text-[14px] text-ink-2">
              Add shareholder or beneficial owner
            </Txt>
          </Pressable>
        </View>

        {/* Declarations */}
        <View className="gap-3.5">
          <CheckRow checked={confirmEntity} onToggle={() => setConfirmEntity((v) => !v)}>
            I confirm that the entity details fetched from the MCA registry are correct and belong to this business.
          </CheckRow>
          <CheckRow checked={confirmOwnership} onToggle={() => setConfirmOwnership((v) => !v)}>
            I confirm the shareholding split above is complete and every individual holding more than {UBO_THRESHOLD}% has
            been disclosed as a beneficial owner.
          </CheckRow>
          <CheckRow checked={confirmPep} onToggle={() => setConfirmPep((v) => !v)}>
            I confirm that no shareholder or beneficial owner listed above is a Politically Exposed Person (PEP), or a
            family member or close associate of a PEP.
          </CheckRow>
        </View>
      </Body>

      <BottomBar
        hint={
          !complete ? (
            <Txt weight={500} className="text-[13px] text-ink-3">
              Accept the declarations to continue
            </Txt>
          ) : undefined
        }
      >
        <PrimaryCTA label="Continue to signatory KYC" disabled={!complete} onPress={() => go('/director-kyc')} />
      </BottomBar>

      {showAdd ? <AddShareholderModal left={left} onAdd={addOwner} onClose={() => setShowAdd(false)} /> : null}
    </View>
  );
}
