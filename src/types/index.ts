import type { FactTag, LocalizedText, VideoClip } from '../contracts';

export type AccuracyKind = FactTag;

export interface MediaCredit {
  id: string;
  imageSrc: string;
  title: LocalizedText;
  creatorOrCollection: string;
  yearOrEra: string;
  license: string;
  sourceUrl: string;
  recommendedFilename: string;
  notes?: LocalizedText;
}

export interface HotspotPin {
  id: string;
  number: number;
  xPercent: number;
  yPercent: number;
  label: LocalizedText;
  description: LocalizedText;
  accuracy: AccuracyKind;
  sourceNote: string;
}

export interface QuizOption {
  id: string;
  text: LocalizedText;
}

export interface QuizQuestion {
  id: string;
  prompt: LocalizedText;
  options: QuizOption[];
  correctOptionId: string;
  explanation: LocalizedText;
  accuracy: AccuracyKind;
}

export interface AcademyDistrict {
  id: string;
  name: LocalizedText;
  eraNote: LocalizedText;
  summary: LocalizedText;
  learningGoals: LocalizedText[];
  imageCreditId: string;
  videoId: string;
  accuracy: AccuracyKind;
  mapCoords: { x: number; y: number };
  hotspots: HotspotPin[];
  artifactIds: string[];
  quiz: QuizQuestion[];
}

export interface ComparisonSpec {
  id: string;
  title: LocalizedText;
  leftLabel: LocalizedText;
  rightLabel: LocalizedText;
  leftDescription: LocalizedText;
  rightDescription: LocalizedText;
  leftImageSrc: string;
  rightImageSrc: string;
}

export interface AcademyArtifact {
  id: string;
  name: LocalizedText;
  districtId: string;
  era: LocalizedText;
  summary: LocalizedText;
  historicalDetail: LocalizedText;
  accuracy: AccuracyKind;
  sourceNote: string;
  imageCreditId: string;
  videoId: string;
  hotspots: HotspotPin[];
  comparison?: ComparisonSpec;
}

export type DialogueTopicCategory =
  | 'daily-life'
  | 'governance'
  | 'science'
  | 'trade'
  | 'architecture';

export interface DialogueTopicChip {
  category: DialogueTopicCategory;
  label: LocalizedText;
  sampleQuestionAr: string;
  sampleQuestionEn: string;
}

export interface KwlData {
  know: string;
  wantToKnow: string;
  learned: string;
  updatedAt: number;
}

export type VideoLibraryItem = VideoClip;
