export type LayoutType = 'single-column' | 'two-column';
export type SectionTitleStyle = 'icon-circle' | 'underline' | 'center-line' | 'left-dot' | 'left-bar' | 'plain';
export type PhotoPosition = 'top-right' | 'sidebar' | 'header-center' | 'none';
export type HeaderAlignment = 'left' | 'center' | 'right';

export interface TemplateConfig {
  id: string;
  name: string;
  layout: {
    type: LayoutType;
    sidebarWidth?: string;
    sidebarPosition?: 'left' | 'right';
    sidebarBg?: string;
    sidebarTextColor?: string;
    containerPadding: string;
  };
  palette: {
    primary: string;
    background: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
  };
  typography: {
    fontFamily: string;
    nameSize: string;
    sectionTitleSize: string;
    itemTitleSize: string;
    bodySize: string;
    lineHeight: number;
  };
  spacing: {
    sectionGap: string;
    itemGap: string;
    bulletGap: string;
  };
  header: {
    alignment: HeaderAlignment;
    showPhoto: boolean;
    photoPosition: PhotoPosition;
    photoSize: string;
    photoBorderRadius: string;
    photoBorderColor?: string;
    separator: string;
    showIcons: boolean;
    showJobTitle: boolean;
    jobTitleColor?: string;
  };
  sectionTitle: {
    style: SectionTitleStyle;
    fontSize: string;
    fontWeight: number;
    letterSpacing?: string;
    borderWidth?: string;
    textTransform?: 'uppercase' | 'none';
    bgColor?: string;
  };
  sectionOrder: string[];
  gradient?: {
    from: string;
    to: string;
    height?: string;
  };
  sidebarSections?: string[];
}
