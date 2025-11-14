import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, BrandColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';

const { width, height } = Dimensions.get('window');

// Onboarding images mapping
const ONBOARDING_IMAGES = {
  welcome: require('@/assets/images/onboarding/1.png'),      // Team at meeting table
  role: require('@/assets/images/onboarding/5.png'),         // Professional woman
  passion: require('@/assets/images/onboarding/2.png'),      // Handshake
  workStyle: require('@/assets/images/onboarding/4.png'),    // Team collaboration
  promise: require('@/assets/images/onboarding/3.png'),      // Woman with tech overlay
};

interface OnboardingStep {
  id: number;
  type: 'welcome' | 'input' | 'choice' | 'info';
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
  image: any;
  question?: string;
  placeholder?: string;
  choices?: string[];
  voiceText?: string;
}

const steps: OnboardingStep[] = [
  {
    id: 1,
    type: 'welcome',
    icon: 'sparkles',
    title: "Hey there!",
    description: "Welcome to RecruitFlow - where hiring meets intelligence. We're about to make your recruitment process smoother than ever.",
    color: BrandColors.teal[500],
    image: ONBOARDING_IMAGES.welcome,
    voiceText: "Let's get you set up in just a few steps!",
  },
  {
    id: 2,
    type: 'input',
    icon: 'briefcase',
    title: "What's your superpower?",
    description: "Tell us what you do. Are you a Recruiter? Hiring Manager? Talent Wizard?",
    question: "Your role:",
    placeholder: "e.g., Senior Recruiter, HR Manager, Talent Lead...",
    color: BrandColors.teal[600],
    image: ONBOARDING_IMAGES.role,
    voiceText: "This helps us personalize your experience",
  },
  {
    id: 3,
    type: 'input',
    icon: 'heart',
    title: "What gets you excited?",
    description: "We're curious - what's the best part about what you do?",
    question: "What you love about your role:",
    placeholder: "e.g., Finding perfect matches, building teams, connecting talent...",
    color: BrandColors.orange[500],
    image: ONBOARDING_IMAGES.passion,
    voiceText: "Share what makes you passionate about hiring",
  },
  {
    id: 4,
    type: 'choice',
    icon: 'rocket',
    title: "How do you work?",
    description: "Pick your style - we'll optimize the experience for you.",
    question: "I'm usually:",
    choices: ['Fast-paced & decisive', 'Thoughtful & thorough', 'Collaborative team player', 'Data-driven analyst'],
    color: BrandColors.teal[500],
    image: ONBOARDING_IMAGES.workStyle,
    voiceText: "No wrong answers here!",
  },
  {
    id: 5,
    type: 'info',
    icon: 'shield-checkmark',
    title: "Our Promise to You",
    description: "RecruitFlow is built on fairness. Every candidate gets equal consideration - no bias, just talent. Plus, we automate the boring stuff so you can focus on the human side.",
    color: BrandColors.teal[600],
    image: ONBOARDING_IMAGES.promise,
    voiceText: "Let's build better teams together!",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [currentStep, setCurrentStep] = useState(0);
  const [userInputs, setUserInputs] = useState<{ [key: number]: string }>({});
  const [selectedChoice, setSelectedChoice] = useState<string>('');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateTransition = (direction: 'next' | 'prev') => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: direction === 'next' ? -50 : 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (direction === 'next') {
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      } else {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
      }
      slideAnim.setValue(direction === 'next' ? 50 : -50);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      handleComplete();
    } else {
      animateTransition('next');
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      animateTransition('prev');
    }
  };

  const handleComplete = async () => {
    // Save user inputs and mark onboarding as complete
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.auth.updateUser({
        data: {
          onboarding_completed: true,
          work_style: selectedChoice,
          role_passion: userInputs[3],
        },
      });
    }
    router.replace('/(tabs)' as any);
  };

  const canProceed = () => {
    const step = steps[currentStep];
    if (step.type === 'input') {
      return userInputs[step.id]?.trim().length > 0;
    }
    if (step.type === 'choice') {
      return selectedChoice.length > 0;
    }
    return true;
  };

  const handleSkip = () => {
    handleComplete();
  };

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={[step.color, BrandColors.teal[700]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentStep + 1} of {steps.length}
          </Text>
        </View>

        {/* Content */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              {/* Image */}
              <View style={styles.illustrationContainer}>
                <View style={styles.imageWrapper}>
                  <Image
                    source={step.image}
                    style={styles.onboardingImage}
                    resizeMode="cover"
                  />
                  <View style={styles.imageOverlay} />
                </View>
              </View>

              {/* Text Content */}
              <View style={styles.textContent}>
                <Text style={styles.title}>{step.title}</Text>
                <Text style={styles.description}>{step.description}</Text>

                {/* Voice Text */}
                {step.voiceText && (
                  <View style={styles.voiceContainer}>
                    <Ionicons name="chatbubble-ellipses" size={16} color={BrandColors.white} />
                    <Text style={styles.voiceText}>{step.voiceText}</Text>
                  </View>
                )}

                {/* Input Field */}
                {step.type === 'input' && (
                  <View style={styles.inputSection}>
                    <Text style={styles.questionLabel}>{step.question}</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder={step.placeholder}
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      value={userInputs[step.id] || ''}
                      onChangeText={(text) => setUserInputs({ ...userInputs, [step.id]: text })}
                      multiline
                      autoFocus
                    />
                  </View>
                )}

                {/* Choice Buttons */}
                {step.type === 'choice' && step.choices && (
                  <View style={styles.choicesSection}>
                    <Text style={styles.questionLabel}>{step.question}</Text>
                    {step.choices.map((choice, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.choiceButton,
                          selectedChoice === choice && styles.choiceButtonSelected,
                        ]}
                        onPress={() => setSelectedChoice(choice)}
                      >
                        <View style={styles.choiceContent}>
                          <Text
                            style={[
                              styles.choiceText,
                              selectedChoice === choice && styles.choiceTextSelected,
                            ]}
                          >
                            {choice}
                          </Text>
                          {selectedChoice === choice && (
                            <Ionicons name="checkmark-circle" size={24} color={BrandColors.white} />
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Navigation */}
        <View style={styles.navigation}>
          {/* Dots Indicator */}
          <View style={styles.dotsContainer}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentStep && styles.dotActive,
                  { backgroundColor: index === currentStep ? BrandColors.white : 'rgba(255,255,255,0.3)' },
                ]}
              />
            ))}
          </View>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            {currentStep > 0 && (
              <TouchableOpacity style={styles.backButton} onPress={handlePrev}>
                <Ionicons name="arrow-back" size={24} color={BrandColors.white} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={!canProceed()}
            >
              <LinearGradient
                colors={
                  canProceed()
                    ? [BrandColors.orange[500], BrandColors.orange[600]]
                    : ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.2)']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextButtonText}>
                  {currentStep === steps.length - 1 ? "Let's Go!" : 'Next'}
                </Text>
                <Ionicons
                  name={currentStep === steps.length - 1 ? 'rocket' : 'arrow-forward'}
                  size={20}
                  color={BrandColors.white}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  skipButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  skipText: {
    color: BrandColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: BrandColors.white,
    borderRadius: 2,
  },
  progressText: {
    color: BrandColors.white,
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.8,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  imageWrapper: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: BrandColors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  onboardingImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 148, 148, 0.15)',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: BrandColors.white,
  },
  textContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: BrandColors.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 17,
    color: BrandColors.white,
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.95,
  },
  navigation: {
    marginTop: 40,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    height: 8,
    borderRadius: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  nextButtonText: {
    color: BrandColors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  voiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    gap: 8,
  },
  voiceText: {
    color: BrandColors.white,
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.95,
  },
  inputSection: {
    width: '100%',
    marginTop: 24,
  },
  questionLabel: {
    color: BrandColors.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 16,
    color: BrandColors.white,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  choicesSection: {
    width: '100%',
    marginTop: 24,
  },
  choiceButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  choiceButtonSelected: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderColor: BrandColors.white,
  },
  choiceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  choiceText: {
    color: BrandColors.white,
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  choiceTextSelected: {
    fontWeight: '700',
  },
});
