import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function shareText(dialogTitle: string, text: string): Promise<void> {
  try {
    const file = new File(Paths.cache, 'muslim-hub-share.txt');
    file.create({ overwrite: true, intermediates: true });
    file.write(text);
    await Sharing.shareAsync(file.uri, { mimeType: 'text/plain', dialogTitle });
  } catch {
    return;
  }
}
