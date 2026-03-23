import fs from 'fs-extra';
import axios from 'axios';
import path from 'path';

const players = [
  {ign: 'JONATHAN', url: 'https://liquipedia.net/commons/images/thumb/d/d3/Godlike_Jonathan_2024.JPG/300px-Godlike_Jonathan_2024.JPG'},
  {ign: 'Goblin', url: 'https://liquipedia.net/commons/images/thumb/d/d4/LE_Goblin.png/300px-LE_Goblin.png'},
  {ign: 'Spower', url: 'https://liquipedia.net/commons/images/thumb/0/06/CG_SPower_2024.png/300px-CG_SPower_2024.png'},
  {ign: 'NinjaJOD', url: 'https://liquipedia.net/commons/images/thumb/3/3a/NinjaJOD_BGIS_2025.jpg/300px-NinjaJOD_BGIS_2025.jpg'},
  {ign: 'Akop', url: 'https://liquipedia.net/commons/images/thumb/d/df/OG_AK_PMGC_2025.png/300px-OG_AK_PMGC_2025.png'},
  {ign: 'Fierce', url: 'https://liquipedia.net/commons/images/thumb/c/c5/RNTX_Fierce_2025.jpg/300px-RNTX_Fierce_2025.jpg'},
  {ign: 'Punkk', url: 'https://liquipedia.net/commons/images/thumb/2/23/RNTX_Punkk_2025.JPG/300px-RNTX_Punkk_2025.JPG'},
  {ign: 'ClutchGod', url: 'https://liquipedia.net/commons/images/thumb/2/29/Clutchgod_GodLike.png/300px-Clutchgod_GodLike.png'},
  {ign: 'AquaNox', url: 'https://liquipedia.net/commons/images/thumb/d/df/AquaNox_GR_2024.png/300px-AquaNox_GR_2024.png'},
  {ign: 'AkshaT', url: 'https://liquipedia.net/commons/images/thumb/e/e0/AkshaT_Soul.png/300px-AkshaT_Soul.png'},
  {ign: 'Admino', url: 'https://liquipedia.net/commons/images/thumb/a/ab/Godlike_ADMINO_2024.jpg/300px-Godlike_ADMINO_2024.jpg'},
  {ign: 'SPRAYGOD', url: 'https://liquipedia.net/commons/images/thumb/d/df/SPRAYGOD_TX.png/300px-SPRAYGOD_TX.png'},
  {ign: 'Rony', url: 'https://liquipedia.net/commons/images/thumb/d/df/Soul_Rony_2025.jpg/300px-Soul_Rony_2025.jpg'},
  {ign: 'Neyoo', url: 'https://liquipedia.net/commons/images/thumb/3/30/Neyoo_GodLike.png/300px-Neyoo_GodLike.png'},
  {ign: 'Snax', url: 'https://liquipedia.net/commons/images/thumb/d/d7/Snax.jpg/300px-Snax.jpg'},
  {ign: 'NakuL', url: 'https://liquipedia.net/commons/images/thumb/6/69/Soul_Nakul_2025.jpg/300px-Soul_Nakul_2025.jpg'},
  {ign: 'Sarang', url: 'https://liquipedia.net/commons/images/thumb/e/ea/Sarang_TX.png/300px-Sarang_TX.png'},
  {ign: 'Attanki', url: 'https://liquipedia.net/commons/images/thumb/0/07/OG_Attanki_PMGC_2025.png/300px-OG_Attanki_PMGC_2025.png'},
  {ign: 'Manya', url: 'https://liquipedia.net/commons/images/thumb/d/d7/Soul_Manya_2025.jpg/300px-Soul_Manya_2025.jpg'},
  {ign: 'Drigger', url: 'https://liquipedia.net/commons/images/thumb/6/6d/Drigger_Orangutan_2023.jpg/300px-Drigger_Orangutan_2023.jpg'}
];

async function downloadImages() {
  await fs.ensureDir(path.join(process.cwd(), 'public', 'players'));
  
  for (const p of players) {
    const filename = path.join(process.cwd(), 'public', 'players', `${p.ign.toLowerCase()}.jpg`);
    try {
      const response = await axios({
        method: 'GET',
        url: p.url,
        responseType: 'arraybuffer',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://liquipedia.net/pubgmobile/Main_Page',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }
      });
      await fs.writeFile(filename, response.data);
      console.log(`Downloaded ${p.ign}`);
    } catch (e) {
      console.error(`Failed to download ${p.ign}: ${e.message}`);
    }
  }
}

downloadImages();
