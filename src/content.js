// Editable content lives in content/*.json. This adapter keeps the static renderer
// independent from the editor. Plain text is escaped before it reaches templates.
import {content,business,settings,photos,hasIllustrativePhotos,seoDetails} from '../cms/data.js';
import {escapeDeep} from './text.js';
export {content,business,settings,photos,hasIllustrativePhotos,seoDetails};
export const templateContent=escapeDeep(content);
export const templateBusiness=escapeDeep(business);
export const templatePhotos=escapeDeep(photos);
export const templateSettings=escapeDeep(settings);
