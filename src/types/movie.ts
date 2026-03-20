export interface MovieCover {
  url: string;
  width: number;
  height: number;
  format: string;
  blurHash: string;
  avgHueLight?: string;
  avgHueDark?: string;
}

export interface StaffMember {
  name: string;
  role: string;
  avatar?: string;
  character?: string;
}

export interface Movie {
  subjectId: string;
  subjectType: 1 | 2; // 1 = movie, 2 = series
  title: string;
  description: string;
  releaseDate: string;
  duration: number;
  genre: string;
  cover: MovieCover;
  countryName: string;
  imdbRatingValue: string;
  imdbRatingCount: number;
  subtitles: string;
  hasResource: boolean;
  trailer: string | null;
  detailPath: string;
  staffList: StaffMember[];
  appointmentCnt: number;
  appointmentDate: string;
  corner: string;
  stills: MovieCover | null;
  postTitle: string;
}

export interface BannerItem {
  id: string;
  title: string;
  image: MovieCover;
  url: string;
  subjectId: string;
  subjectType: 1 | 2;
  subject: Movie;
  detailPath: string;
}

export interface OperatingListItem {
  type: string;
  position: number;
  title: string;
  subjects: Movie[];
  banner?: {
    items: BannerItem[];
  };
}

export interface HomepageData {
  topPickList: Movie[];
  homeList: Movie[];
  platformList: { name: string; uploadBy: string }[];
  operatingList: OperatingListItem[];
}

export interface TrendingData {
  subjectList: Movie[];
  page: number;
  perPage: number;
}

export interface SearchData {
  pager: {
    hasMore: boolean;
    nextPage: string;
    page: string;
    perPage: number;
    totalCount: number;
  };
  items: Movie[];
}

export interface MediaStream {
  url: string;
  quality?: string;
  format?: string;
  label?: string;
}

export interface MediaData {
  streams?: MediaStream[];
  subtitles?: { url: string; lang: string; label: string }[];
  downloadLinks?: { url: string; quality: string }[];
  m3u8?: string;
  video?: string;
  [key: string]: unknown;
}

export interface ApiResponse<T> {
  status: string;
  statusCode: number;
  creator: string;
  endpoint: string;
  data: T;
}
