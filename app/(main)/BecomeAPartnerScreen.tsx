import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  ChevronLeft,
  Building2,
  FileText,
  Mail,
  Phone,
  Globe,
  Instagram,
  Facebook,
  Heart,
  CheckCircle2,
  ChevronRight,
  Upload,
  ImageIcon,
  X,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

import { submitPartnerApplication } from '@/lib/partners';
import { logError } from '@/lib/observability';
import { useAuth } from '@/lib/auth-context';

const ORG_TYPES = ['Foundation', 'NGO', 'Religious Org', 'Government Agency', 'Other'];

const FOCUS_AREAS = [
  'Disaster Relief', 'Children & Youth', 'Education', 'Environment',
  'Health & Medical', 'Poverty Alleviation', 'Animal Welfare', 'Elderly Care',
];

function Field({
  label, placeholder, value, onChangeText, icon, multiline,
  keyboardType, required, hint,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  icon?: React.ReactNode;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'url';
  required?: boolean;
  hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={f.wrap}>
      <Text style={f.label}>
        {label}{required && <Text style={f.req}> *</Text>}
      </Text>
      <View style={[f.inputRow, focused && f.inputRowFocused, multiline && { alignItems: 'flex-start' }]}>
        {icon && <View style={[f.iconWrap, multiline && { marginTop: 2 }]}>{icon}</View>}
        <TextInput
          style={[f.input, multiline && { height: 96, textAlignVertical: 'top' }]}
          placeholder={placeholder}
          placeholderTextColor="#BCBCBC"
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          keyboardType={keyboardType ?? 'default'}
          autoCapitalize={keyboardType === 'email-address' || keyboardType === 'url' ? 'none' : 'sentences'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
      {hint && <Text style={f.hint}>{hint}</Text>}
    </View>
  );
}

const f = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#374151', marginBottom: 6 },
  req: { color: '#E91E63' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    minHeight: 48,
  },
  inputRowFocused: { borderColor: '#4289AB', backgroundColor: '#F0F7FB' },
  iconWrap: { marginRight: 8 },
  input: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#1A2C3D',
    paddingVertical: 10,
  },
  hint: { fontFamily: 'Poppins_400Regular', fontSize: 10, color: '#9CA3AF', marginTop: 4 },
});

function ImageUploadField({
  label, value, onPick, onClear, required, hint,
}: {
  label: string;
  value: string | null;
  onPick: () => void;
  onClear: () => void;
  required?: boolean;
  hint?: string;
}) {
  return (
    <View style={f.wrap}>
      <Text style={f.label}>
        {label}{required && <Text style={f.req}> *</Text>}
      </Text>
      {value ? (
        <View style={img.previewWrap}>
          <Image source={{ uri: value }} style={img.preview} resizeMode="cover" />
          <Pressable onPress={onClear} style={img.clearBtn}>
            <X size={14} color="#fff" />
          </Pressable>
          <Pressable onPress={onPick} style={img.changeBtn}>
            <Text style={img.changeBtnText}>Change</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={onPick} style={img.uploadBox}>
          <View style={img.uploadIconWrap}>
            <Upload size={22} color="#4289AB" />
          </View>
          <Text style={img.uploadTitle}>Tap to upload</Text>
          <Text style={img.uploadSub}>PNG, JPG up to 5MB</Text>
        </Pressable>
      )}
      {hint && <Text style={f.hint}>{hint}</Text>}
    </View>
  );
}

const img = StyleSheet.create({
  previewWrap: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    height: 130,
    backgroundColor: '#F3F4F6',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  clearBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  changeBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#fff',
  },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: '#C7DDE8',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F7FB',
    gap: 6,
  },
  uploadIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DFF0F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  uploadTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#4289AB',
  },
  uploadSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#9CA3AF',
  },
});

export default function BecomeAPartnerScreen() {
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('');
  const [otherSector, setOtherSector] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [mission, setMission] = useState('');
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [website, setWebsite] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [bannerUri, setBannerUri] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const { user } = useAuth();

  async function pickImage(onSet: (uri: string) => void) {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library to upload images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      onSet(result.assets[0].uri);
    }
  }

  function toggleFocus(area: string) {
    setFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }

  async function handleSubmit() {
    const effectiveType = orgType === 'Other' ? otherSector.trim() : orgType;
    if (!orgName.trim() || !effectiveType || !regNumber.trim() || !mission.trim() ||
        !contactName.trim() || !contactEmail.trim() || !contactPhone.trim() || focusAreas.length === 0) {
      Alert.alert('Incomplete Form', 'Please fill in all required fields and select at least one focus area.');
      return;
    }
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in before submitting a partner application.');
      return;
    }

    setSubmitting(true);
    try {
      const application = await submitPartnerApplication({
        orgName,
        orgType: effectiveType,
        registrationNumber: regNumber,
        taxNumber: taxNumber,
        mission,
        focusAreas,
        website,
        contactName,
        contactEmail,
        contactPhone,
        facebook,
        instagram,
      });
      setReferenceNumber(`LV-CHARITY-${application.id.slice(0, 8).toUpperCase()}`);
      setSubmitted(true);
    } catch (error) {
      logError(error, { area: 'BecomeAPartnerScreen.handleSubmit' });
      Alert.alert('Could not submit', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
        <LinearGradient
          colors={['#1A5C7A', '#4289AB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.successHero}>
          <SafeAreaView edges={['top']} style={s.successHeroInner}>
            <Animated.View entering={FadeIn.delay(100).duration(500)} style={s.successIconWrap}>
              <CheckCircle2 size={72} color="#fff" strokeWidth={1.5} />
            </Animated.View>
            <Animated.Text entering={FadeInDown.delay(250).duration(500)} style={s.successTitle}>
              Application Submitted!
            </Animated.Text>
            <Animated.Text entering={FadeInDown.delay(380).duration(500)} style={s.successSub}>
              Thank you, <Text style={{ fontFamily: 'Poppins_700Bold' }}>{orgName}</Text>.{'\n'}
              Our team will review your application within 3–5 business days.
            </Animated.Text>
          </SafeAreaView>
        </LinearGradient>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <Animated.View entering={FadeInDown.delay(400).duration(400)} style={s.successCard}>
            <Text style={s.successCardTitle}>What happens next?</Text>
            {[
              { step: '1', text: 'Our partnerships team reviews your application.' },
              { step: '2', text: 'We email you to schedule an onboarding call.' },
              { step: '3', text: 'Your charity profile goes live on LuvLots.' },
              { step: '4', text: 'Celebrities can start listing items for your cause.' },
            ].map((item) => (
              <View key={item.step} style={s.stepRow}>
                <View style={s.stepNum}>
                  <Text style={s.stepNumText}>{item.step}</Text>
                </View>
                <Text style={s.stepText}>{item.text}</Text>
              </View>
            ))}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500).duration(400)} style={s.refCard}>
            <Text style={s.refLabel}>Reference Number</Text>
            <Text style={s.refValue}>{referenceNumber}</Text>
            <Text style={s.refHint}>Keep this for your records. We'll also send a confirmation to your email.</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600).duration(400)}>
            <Pressable
              onPress={() => router.replace('/(tabs)/(charity)' as any)}
              style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1 }]}>
              <LinearGradient
                colors={['#1A5C7A', '#4289AB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.doneBtn}>
                <Text style={s.doneBtnText}>Back to Charity Page</Text>
                <ChevronRight size={16} color="#fff" />
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      <LinearGradient
        colors={['#1A5C7A', '#4289AB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.heroGrad}>
        <SafeAreaView edges={['top']}>
          <View style={s.header}>
            <Pressable onPress={() => router.back()} style={s.backBtn}>
              <ChevronLeft size={22} color="#fff" />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={s.headerTitle}>Become a Charity Partner</Text>
              <Text style={s.headerSub}>Register your organization on LuvLots</Text>
            </View>
          </View>
          <View style={s.heroBadgeRow}>
            <View style={s.heroBadge}>
              <Heart size={12} color="#E91E63" fill="#E91E63" />
              <Text style={s.heroBadgeText}>Verified Partners</Text>
            </View>
            <View style={s.heroBadge}>
              <CheckCircle2 size={12} color="#10B981" />
              <Text style={s.heroBadgeText}>100% to Charity</Text>
            </View>
            <View style={s.heroBadge}>
              <Globe size={12} color="#fff" />
              <Text style={s.heroBadgeText}>Philippines-Based</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* Section 1: Organization Info */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={s.section}>
            <View style={s.sectionHeader}>
              <Building2 size={15} color="#4289AB" />
              <Text style={s.sectionTitle}>Organization Information</Text>
            </View>

            <Field
              label="Organization Name"
              placeholder="e.g. Philippine Red Cross"
              value={orgName}
              onChangeText={setOrgName}
              required
            />

            {/* Org Type chips */}
            <Text style={[f.label, { marginBottom: 8 }]}>
              Organization Type <Text style={{ color: '#E91E63' }}>*</Text>
            </Text>
            <View style={s.chipsWrap}>
              {ORG_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setOrgType(type)}
                  style={[s.chip, orgType === type && s.chipActive]}>
                  <Text style={[s.chipText, orgType === type && s.chipTextActive]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* "Other" expands a text field */}
            {orgType === 'Other' && (
              <Animated.View entering={FadeInDown.duration(300)}>
                <Field
                  label="Please specify your sector"
                  placeholder="e.g. Sports Development, Arts & Culture..."
                  value={otherSector}
                  onChangeText={setOtherSector}
                  required
                />
              </Animated.View>
            )}

            <Field
              label="SEC / CDA Registration Number"
              placeholder="e.g. CN201234567"
              value={regNumber}
              onChangeText={setRegNumber}
              icon={<FileText size={15} color="#9CA3AF" />}
              required
              hint="Your Securities and Exchange Commission or Cooperative Development Authority number."
            />
            <Field
              label="BIR Tax Exemption Number"
              placeholder="e.g. EO 93-012345"
              value={taxNumber}
              onChangeText={setTaxNumber}
              icon={<FileText size={15} color="#9CA3AF" />}
              hint="Optional — helps us verify your tax-exempt status."
            />
            <Field
              label="Website"
              placeholder="https://yourcharity.org"
              value={website}
              onChangeText={setWebsite}
              icon={<Globe size={15} color="#9CA3AF" />}
              keyboardType="url"
            />
          </Animated.View>

          {/* Section 2: Profile Images */}
          <Animated.View entering={FadeInDown.delay(150).duration(400)} style={s.section}>
            <View style={s.sectionHeader}>
              <ImageIcon size={15} color="#4289AB" />
              <Text style={s.sectionTitle}>Profile Images</Text>
            </View>

            <ImageUploadField
              label="Organization Logo"
              value={logoUri}
              onPick={() => pickImage(setLogoUri)}
              onClear={() => setLogoUri(null)}
              hint="Square image recommended. Shown on your charity card and profile."
            />
            <ImageUploadField
              label="Cover / Banner Photo"
              value={bannerUri}
              onPick={() => pickImage(setBannerUri)}
              onClear={() => setBannerUri(null)}
              hint="Wide landscape photo that represents your cause. Shown at the top of your profile."
            />
          </Animated.View>

          {/* Section 3: About Your Cause */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={s.section}>
            <View style={s.sectionHeader}>
              <Heart size={15} color="#E91E63" />
              <Text style={s.sectionTitle}>About Your Cause</Text>
            </View>

            <Field
              label="Mission Statement"
              placeholder="Describe what your organization does and the communities you serve..."
              value={mission}
              onChangeText={setMission}
              multiline
              required
            />

            <Text style={[f.label, { marginBottom: 4 }]}>
              Focus Areas <Text style={{ color: '#E91E63' }}>*</Text>
            </Text>
            <Text style={[f.hint, { marginBottom: 10 }]}>Select all that apply.</Text>
            <View style={s.chipsWrap}>
              {FOCUS_AREAS.map((area) => (
                <TouchableOpacity
                  key={area}
                  onPress={() => toggleFocus(area)}
                  style={[s.chip, focusAreas.includes(area) && s.chipActive]}>
                  {focusAreas.includes(area) && (
                    <CheckCircle2 size={11} color="#fff" style={{ marginRight: 4 }} />
                  )}
                  <Text style={[s.chipText, focusAreas.includes(area) && s.chipTextActive]}>{area}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Section 4: Contact Details */}
          <Animated.View entering={FadeInDown.delay(250).duration(400)} style={s.section}>
            <View style={s.sectionHeader}>
              <Mail size={15} color="#4289AB" />
              <Text style={s.sectionTitle}>Contact Details</Text>
            </View>

            <Field
              label="Contact Person Name"
              placeholder="e.g. Maria Santos"
              value={contactName}
              onChangeText={setContactName}
              required
            />
            <Field
              label="Email Address"
              placeholder="partnerships@yourcharity.org"
              value={contactEmail}
              onChangeText={setContactEmail}
              icon={<Mail size={15} color="#9CA3AF" />}
              keyboardType="email-address"
              required
            />
            <Field
              label="Phone Number"
              placeholder="+63 9XX XXX XXXX"
              value={contactPhone}
              onChangeText={setContactPhone}
              icon={<Phone size={15} color="#9CA3AF" />}
              keyboardType="phone-pad"
              required
            />
          </Animated.View>

          {/* Section 5: Online Presence */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={s.section}>
            <View style={s.sectionHeader}>
              <Globe size={15} color="#4289AB" />
              <Text style={s.sectionTitle}>
                Online Presence{' '}
                <Text style={s.optional}>(Optional)</Text>
              </Text>
            </View>

            <Field
              label="Facebook Page"
              placeholder="facebook.com/yourpage"
              value={facebook}
              onChangeText={setFacebook}
              icon={<Facebook size={15} color="#9CA3AF" />}
              keyboardType="url"
            />
            <Field
              label="Instagram"
              placeholder="@yourcharity"
              value={instagram}
              onChangeText={setInstagram}
              icon={<Instagram size={15} color="#9CA3AF" />}
            />
          </Animated.View>

          {/* Disclaimer */}
          <Animated.View entering={FadeInDown.delay(340).duration(400)} style={s.disclaimer}>
            <Text style={s.disclaimerText}>
              By submitting this form, you confirm that all information provided is accurate and that your
              organization is a legitimate registered charity in the Philippines. LuvLots reserves the right
              to verify credentials and approve or decline partner applications.
            </Text>
          </Animated.View>

          {/* Submit */}
          <Animated.View entering={FadeInDown.delay(380).duration(400)}>
            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              style={({ pressed }) => [{ opacity: pressed || submitting ? 0.7 : 1 }]}>
              <LinearGradient
                colors={['#1A5C7A', '#4289AB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.submitBtn}>
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Heart size={18} color="#fff" fill="#fff" />
                    <Text style={s.submitBtnText}>Submit Application</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  heroGrad: { paddingBottom: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#fff', lineHeight: 24 },
  headerSub: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  heroBadgeRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, flexWrap: 'wrap' },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  heroBadgeText: { fontFamily: 'Poppins_600SemiBold', fontSize: 10, color: '#fff' },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: { fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#1A2C3D' },
  optional: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  chipActive: { backgroundColor: '#4289AB', borderColor: '#4289AB' },
  chipText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#6B7280' },
  chipTextActive: { color: '#fff' },
  disclaimer: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 16,
  },
  disclaimerText: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#92400E', lineHeight: 17 },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 8,
  },
  submitBtnText: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: '#fff' },
  // Success
  successHero: { paddingBottom: 28 },
  successHeroInner: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 28, paddingBottom: 8 },
  successIconWrap: { marginBottom: 16 },
  successTitle: { fontFamily: 'Poppins_700Bold', fontSize: 26, color: '#fff', marginBottom: 8 },
  successSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  successCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  successCardTitle: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: '#1A2C3D', marginBottom: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#4289AB',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumText: { fontFamily: 'Poppins_700Bold', fontSize: 12, color: '#fff' },
  stepText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
    paddingTop: 3,
  },
  refCard: {
    backgroundColor: '#EDF4F8',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C7DDE8',
  },
  refLabel: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#4289AB', marginBottom: 4 },
  refValue: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: '#1A2C3D', letterSpacing: 0.8, marginBottom: 6 },
  refHint: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
  },
  doneBtnText: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: '#fff' },
});
