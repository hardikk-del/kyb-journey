import { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { Check, ChevronDown, Eye, Landmark, Plus, Search, Trash2, X } from 'lucide-react-native';

import { Body, BottomBar, PrimaryCTA, ScreenHeader } from '@/components/layout';
import { Txt } from '@/components/Txt';
import { Checkbox, FieldLabel, Segmented } from '@/components/kyb/controls';
import { Dropzone } from '@/components/kyb/docs';
import { useUpload } from '@/lib/useUpload';
import { useStepHeader } from '@/lib/steps';
import { go } from '@/lib/nav';
import { C, shadowXs } from '@/lib/tokens';
import { cn } from '@/lib/cn';

/* ---------------- bank list ----------------
 * Real bundled logos (assets/images/banks). `short` + `color` stay as a fallback
 * avatar for any bank whose `logo` is missing. */

interface Bank {
  name: string;
  short: string;
  color: string;
  logo?: number;
}

const BANKS: Bank[] = [
  { name: 'HDFC Bank', short: 'HDFC', color: 'rgb(0, 76, 143)', logo: require('../../assets/images/banks/hdfc.webp') },
  { name: 'ICICI Bank', short: 'ICICI', color: 'rgb(176, 42, 48)', logo: require('../../assets/images/banks/icici.jpg') },
  { name: 'State Bank of India (SBI)', short: 'SBI', color: 'rgb(34, 64, 154)', logo: require('../../assets/images/banks/sbi.png') },
  { name: 'Axis Bank', short: 'AXIS', color: 'rgb(151, 20, 77)', logo: require('../../assets/images/banks/axis.png') },
  { name: 'Kotak Mahindra Bank', short: 'KOTAK', color: 'rgb(228, 0, 43)', logo: require('../../assets/images/banks/kotak.png') },
  { name: 'IDFC FIRST Bank', short: 'IDFC', color: 'rgb(158, 27, 50)', logo: require('../../assets/images/banks/idfc.png') },
];

/** Logo on a clean white tile (hairline border); falls back to a coloured
 *  initials tile when a bank has no bundled logo. */
function BankLogo({ bank, size = 40 }: { bank: Bank; size?: number }) {
  if (bank.logo) {
    return (
      <View
        style={{ width: size, height: size }}
        className="items-center justify-center overflow-hidden rounded-lg border border-line bg-white"
      >
        <Image source={bank.logo} style={{ width: size - 10, height: size - 10 }} contentFit="contain" />
      </View>
    );
  }
  return (
    <View style={{ width: size, height: size, backgroundColor: bank.color }} className="items-center justify-center rounded-lg">
      <Txt weight={700} style={{ fontSize: size <= 28 ? 8 : 9 }} className="text-white">
        {bank.short}
      </Txt>
    </View>
  );
}

/* ---------------- searchable bank picker (controlled modal) ---------------- */

function BankPickerModal({
  visible,
  value,
  onChange,
  onClose,
}: {
  visible: boolean;
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const results = BANKS.filter((b) => b.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 justify-end bg-black/40">
        <Pressable className="max-h-[76%] rounded-t-2xl bg-card pb-8 pt-2">
          <View className="mb-1 items-center py-2">
            <View className="h-1 w-10 rounded-full bg-line-strong" />
          </View>
          <View className="px-5 pb-2">
            <Txt weight={700} className="text-[15px] text-ink">
              Select bank
            </Txt>
            <View className="mt-3 h-11 flex-row items-center gap-2 rounded-lg border border-line-strong bg-card px-3">
              <Search size={16} color={C.ink3} strokeWidth={2} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search banks"
                placeholderTextColor="rgb(141,141,141)"
                autoFocus
                style={{ fontFamily: 'DMSans_500Medium' }}
                className="flex-1 text-[14px] text-ink"
              />
            </View>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">
            {results.map((b) => {
              const on = b.name === value;
              return (
                <Pressable
                  key={b.name}
                  onPress={() => {
                    onChange(b.name);
                    setQuery('');
                    onClose();
                  }}
                  className="h-16 flex-row items-center gap-3 px-5 active:bg-grey-50"
                >
                  <BankLogo bank={b} size={40} />
                  <Txt weight={on ? 700 : 500} className="flex-1 text-[15px] text-ink">
                    {b.name}
                  </Txt>
                  {on ? <Check size={18} color={C.brand} strokeWidth={2.5} /> : null}
                </Pressable>
              );
            })}
            {results.length === 0 ? (
              <Txt className="px-5 py-6 text-center text-[13px] text-ink-3">No banks match "{query}"</Txt>
            ) : null}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ---------------- account type chips ---------------- */

type AccType = 'current' | 'savings' | 'cc' | 'od' | 'loan';

const ACC_TYPES: { value: AccType; label: string }[] = [
  { value: 'current', label: 'Current' },
  { value: 'savings', label: 'Savings' },
  { value: 'cc', label: 'Cash Credit (CC)' },
  { value: 'od', label: 'Overdraft (OD)' },
  { value: 'loan', label: 'Loan' },
];

// Sample bank statement shown once a CC/OD statement is "received".
const STATEMENT_IMG = 'https://imgv2-1-f.scribdassets.com/img/document/636483454/original/b29e18bdc1/1?v=1';

// Credit-facility question is only meaningful for borrowing accounts.
const CREDIT_TYPES: AccType[] = ['cc', 'od', 'loan'];
// A statement is collected for drawing facilities that are actively used.
const STATEMENT_TYPES: AccType[] = ['cc', 'od'];

function TypeChips({ value, onChange }: { value: AccType | null; onChange: (v: AccType) => void }) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {ACC_TYPES.map((t) => {
        const on = t.value === value;
        return (
          <Pressable
            key={t.value}
            onPress={() => onChange(t.value)}
            className={cn(
              'h-9 items-center justify-center rounded-full border px-3.5',
              on ? 'border-blue-500 bg-blue-50' : 'border-line-strong bg-card',
            )}
          >
            <Txt weight={600} className={cn('text-[13px]', on ? 'text-blue-700' : 'text-ink-2')}>
              {t.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ---------------- account model + card ---------------- */

interface Account {
  id: string;
  bank: string;
  type: AccType | null;
  activeFacility: boolean;
}

function AccountCard({
  account,
  onChange,
  onRemove,
}: {
  account: Account;
  onChange: (patch: Partial<Account>) => void;
  onRemove: () => void;
}) {
  const slot = useUpload('idle');
  const [viewer, setViewer] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const selectedBank = BANKS.find((b) => b.name === account.bank);
  const showCredit = account.type != null && CREDIT_TYPES.includes(account.type);
  const needsStatement =
    account.type != null && STATEMENT_TYPES.includes(account.type) && account.activeFacility;
  const statementPending = needsStatement && slot.status !== 'verified';
  const typeLabel = ACC_TYPES.find((t) => t.value === account.type)?.label;
  const subtitle = !selectedBank ? 'Tap to choose your bank' : (typeLabel ?? 'Select account type');

  return (
    <View style={shadowXs} className="gap-3.5 rounded-xl border border-line bg-card p-4">
      {/* header doubles as the bank selector */}
      <View className="flex-row items-center gap-2">
        <Pressable onPress={() => setPickerOpen(true)} className="flex-1 flex-row items-center gap-3">
          {selectedBank ? (
            <BankLogo bank={selectedBank} size={44} />
          ) : (
            <View className="h-11 w-11 items-center justify-center rounded-lg bg-grey-100">
              <Landmark size={20} color={C.ink3} strokeWidth={2} />
            </View>
          )}
          <View className="flex-1">
            <Txt weight={700} numberOfLines={1} className="text-[15px] text-ink">
              {selectedBank ? selectedBank.name : 'Select bank'}
            </Txt>
            <Txt numberOfLines={1} className="text-[12.5px] text-ink-3">
              {subtitle}
            </Txt>
          </View>
          <ChevronDown size={18} color={C.ink3} strokeWidth={2} />
        </Pressable>
        <Pressable
          onPress={onRemove}
          hitSlop={6}
          className="h-8 w-8 items-center justify-center rounded-lg border border-line active:bg-grey-50"
        >
          <Trash2 size={15} color={C.neg} strokeWidth={2} />
        </Pressable>
      </View>

      <View className="h-px bg-line" />

      <View className="gap-2">
        <FieldLabel required>Account type</FieldLabel>
        <TypeChips
          value={account.type}
          onChange={(type) => {
            // Reset the credit facility + statement whenever the type changes so a
            // non-borrowing type never carries a stale "Yes".
            onChange({ type, activeFacility: false });
            slot.reset();
          }}
        />
      </View>

      {showCredit ? (
        <View className="gap-2">
          <FieldLabel>Active credit facility?</FieldLabel>
          <Segmented
            value={account.activeFacility ? 'yes' : 'no'}
            onChange={(v) => {
              const active = v === 'yes';
              onChange({ activeFacility: active });
              if (!active) slot.reset();
            }}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ]}
          />
        </View>
      ) : null}

      {needsStatement ? (
        <View className="gap-1.5">
          <View className="flex-row items-center justify-between">
            <FieldLabel>Recent bank statement (last 3 months)</FieldLabel>
            {statementPending ? (
              <View className="h-6 flex-row items-center rounded-full bg-amber-50 px-2">
                <Txt weight={600} className="text-[10.5px] text-amber-700">
                  Pending
                </Txt>
              </View>
            ) : null}
          </View>
          {slot.status === 'idle' ? (
            <Dropzone title="Upload statement" hint="PDF / JPG / PNG · max 10 MB" onPick={slot.start} dense />
          ) : slot.status === 'verified' ? (
            <View className="gap-2.5">
              <Pressable onPress={() => setViewer(true)} className="w-full overflow-hidden rounded-lg border border-line">
                <Image source={{ uri: STATEMENT_IMG }} style={{ width: '100%', height: 150 }} contentFit="cover" contentPosition="top" />
                <View className="absolute bottom-2.5 right-2.5 h-7 flex-row items-center gap-1.5 rounded-full bg-ink/90 px-2.5">
                  <Eye size={13} color="#fff" strokeWidth={2} />
                  <Txt weight={500} className="text-[12px] text-white">
                    Tap to view
                  </Txt>
                </View>
              </Pressable>
              <View className="flex-row items-center justify-between gap-3 rounded-xl border border-green-300 bg-green-50 px-3.5 py-3">
                <View className="flex-1 flex-row items-center gap-2.5">
                  <View className="h-7 w-7 items-center justify-center rounded-full bg-green-500">
                    <Check size={15} color="#fff" strokeWidth={3} />
                  </View>
                  <Txt weight={600} className="flex-1 text-[13.5px] text-green-700">
                    Statement verified
                  </Txt>
                </View>
                <Pressable
                  onPress={slot.reset}
                  hitSlop={6}
                  className="h-8 flex-row items-center gap-1.5 rounded-md border border-line bg-card px-2.5 active:bg-grey-50"
                >
                  <Trash2 size={14} color={C.neg} strokeWidth={2} />
                  <Txt weight={600} className="text-[12.5px] text-red-500">
                    Remove
                  </Txt>
                </Pressable>
              </View>
            </View>
          ) : (
            <View
              style={shadowXs}
              className="w-full flex-row items-center justify-center gap-2.5 rounded-xl border border-blue-200 bg-blue-50/60 px-4 py-6"
            >
              <ActivityIndicator color={C.brand} />
              <Txt weight={600} className="text-[14px] text-ink-2">
                Verifying statement…
              </Txt>
            </View>
          )}
        </View>
      ) : null}

      <BankPickerModal
        visible={pickerOpen}
        value={account.bank}
        onChange={(bank) => onChange({ bank })}
        onClose={() => setPickerOpen(false)}
      />

      <Modal visible={viewer} transparent animationType="fade" onRequestClose={() => setViewer(false)}>
        <View className="flex-1 bg-black/80">
          <View className="flex-row items-center justify-between px-5 pb-4 pt-16">
            <Txt weight={600} className="text-[16px] text-white">
              Bank statement
            </Txt>
            <Pressable
              onPress={() => setViewer(false)}
              hitSlop={8}
              className="h-9 w-9 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
            >
              <X size={20} color="#fff" strokeWidth={2} />
            </Pressable>
          </View>
          <ScrollView contentContainerClassName="flex-grow items-center justify-center px-5 py-6">
            <Image source={{ uri: STATEMENT_IMG }} style={{ width: '100%', height: 500 }} contentFit="contain" />
          </ScrollView>
        </View>
      </Modal>
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

let seq = 0;
const newAccount = (): Account => ({ id: `acc${Date.now()}_${seq++}`, bank: '', type: null, activeFacility: false });

/* ---------------- screen ---------------- */

export default function ExistingBankAccountsScreen() {
  const [answer, setAnswer] = useState<'yes' | 'no' | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [declared, setDeclared] = useState(false);

  const setAnswerAndSeed = (v: 'yes' | 'no') => {
    setAnswer(v);
    setDeclared(false);
    // Seed one blank card the first time "Yes" is chosen.
    if (v === 'yes' && accounts.length === 0) setAccounts([newAccount()]);
  };

  const patchAccount = (id: string, patch: Partial<Account>) =>
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  const removeAccount = (id: string) => setAccounts((prev) => prev.filter((a) => a.id !== id));

  const accountsValid = useMemo(
    () => accounts.length > 0 && accounts.every((a) => a.bank !== '' && a.type != null),
    [accounts],
  );

  const canContinue =
    answer === 'no' ? declared : answer === 'yes' ? accountsValid && declared : false;

  const hint =
    answer == null
      ? 'Answer the question above to continue'
      : answer === 'yes' && !accountsValid
        ? 'Add at least one account with a bank and type'
        : !declared
          ? 'Accept the declaration to continue'
          : undefined;

  return (
    <View className="flex-1 bg-page">
      <ScreenHeader {...useStepHeader('banking')} title="Existing Bank Accounts" />

      <Body className="gap-5">
        <Txt className="text-[14px] leading-[20px] text-ink-2">
          Tell us about the business's existing banking relationships.
        </Txt>

        {/* Gate question */}
        <View style={shadowXs} className="gap-3 rounded-xl border border-line bg-card p-4">
          <Txt weight={700} className="text-[15px] tracking-[-0.2px] text-ink">
            Does this business have accounts with other banks?
          </Txt>
          <Segmented
            value={answer}
            onChange={setAnswerAndSeed}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ]}
          />
        </View>

        {/* No path */}
        {answer === 'no' ? (
          <View className="gap-4">
            <View className="rounded-xl border border-line bg-grey-50 px-4 py-3.5">
              <Txt className="text-[13.5px] leading-[19px] text-ink-2">
                Noted — we'll record that this business has no other banking relationships.
              </Txt>
            </View>
            <CheckRow checked={declared} onToggle={() => setDeclared((v) => !v)}>
              I confirm this business does not hold accounts with any other bank.
            </CheckRow>
          </View>
        ) : null}

        {/* Yes path */}
        {answer === 'yes' ? (
          <View className="gap-3.5">
            {accounts.map((a) => (
              <AccountCard
                key={a.id}
                account={a}
                onChange={(patch) => patchAccount(a.id, patch)}
                onRemove={() => removeAccount(a.id)}
              />
            ))}

            <Pressable
              onPress={() => setAccounts((prev) => [...prev, newAccount()])}
              className="h-12 flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong bg-card active:bg-grey-50"
            >
              <Plus size={18} color={C.ink2} strokeWidth={2} />
              <Txt weight={600} className="text-[14px] text-ink-2">
                Add another account
              </Txt>
            </Pressable>

            <View className="mt-1">
              <CheckRow checked={declared} onToggle={() => setDeclared((v) => !v)}>
                I confirm the above information is accurate to the best of my knowledge.
              </CheckRow>
            </View>
          </View>
        ) : null}
      </Body>

      <BottomBar hint={hint ? <Txt className="text-[13px] text-ink-3">{hint}</Txt> : undefined}>
        <PrimaryCTA label="Continue" disabled={!canContinue} onPress={() => go('/business-doc-incorporation')} />
      </BottomBar>
    </View>
  );
}
