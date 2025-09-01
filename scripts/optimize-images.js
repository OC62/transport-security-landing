import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function optimizeImages() {
  const directories = ['src/assets/images', 'public/images'];
  
  console.log('Начинаем оптимизацию изображений...');
  
  for (const dir of directories) {
    try {
      const fullDirPath = path.join(__dirname, '..', dir);
      const files = await fs.readdir(fullDirPath);
      
      for (const file of files) {
        if (/\.(jpg|jpeg|png)$/i.test(file)) {
          const inputPath = path.join(fullDirPath, file);
          const outputPath = path.join(fullDirPath, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
          
          // Пропускаем, если webp версия уже существует
          try {
            await fs.access(outputPath);
            console.log(`✓ ${file} уже оптимизирован`);
            continue;
          } catch {
            // Файл не существует, продолжаем обработку
          }
          
          try {
            await sharp(inputPath)
              .webp({ quality: 80 })
              .toFile(outputPath);
            
            console.log(`✓ Оптимизирован: ${file} -> ${path.basename(outputPath)}`);
          } catch (error) {
            console.error(`✗ Ошибка при обработке ${file}:`, error.message);
          }
        }
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`Директория ${dir} не существует, пропускаем`);
      } else {
        console.error(`Ошибка при обработке директории ${dir}:`, error.message);
      }
    }
  }
  
  console.log('Оптимизация изображений завершена!');
}

optimizeImages().catch(console.error);