// src/assets/icons/icons.ts
import { FilterSvgIconComponent } from './other/filterIcon';
import { SearchSvgIconComponent } from './other/searchIcon';
import { ArrowSvgIconComponent } from './other/arrowIcon';
import { HomeSvgIconComponent } from './other/homeIcon';
import { PostSvgIconComponent } from './other/postIcon';
import { DeepDiveSvgIconComponent } from './other/deepDiveIcon';
import { LongArrowSvgIconComponent } from './other/longArrowIcon';
import { GitHubBrandSvgIconComponent } from './brands/GitHubBrand';
import { LinkedinBrandSvgIconComponent } from './brands/LinkedinBrand';
import { InstagramBrandSvgIconComponent } from './brands/InstagramBrand';
import { LogoSvgIconComponent } from './logo/InabaLogo';

export const FilterIcons = {
    Filter: FilterSvgIconComponent,
    Search: SearchSvgIconComponent,
    ArrowDown: ArrowSvgIconComponent,
};

export const NavIcons = {
    Home: HomeSvgIconComponent,
    Post: PostSvgIconComponent,
    Research: DeepDiveSvgIconComponent,
};

export const SocialIcons = {
    Github: GitHubBrandSvgIconComponent,
    Linkedin: LinkedinBrandSvgIconComponent,
    Instagram: InstagramBrandSvgIconComponent,
};

export const OtherIcons = {
    LongArrow: LongArrowSvgIconComponent,
};

export const LogoIcon = LogoSvgIconComponent;
