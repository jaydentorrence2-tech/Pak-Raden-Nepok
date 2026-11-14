export type HandSkinId = 'normal' | 'giant' | 'robot' | 'fire';

export interface HandSkin {
  id: HandSkinId;
  name: string;
  unlockScore: number;
  description: string;
}

export const HAND_SKINS: HandSkin[] = [
  {
    id: 'normal',
    name: 'Tangan Polos',
    unlockScore: 0,
    description: 'Tepokan standar penuh penghayatan.',
  },
  {
    id: 'giant',
    name: 'Tangan Raksasa',
    unlockScore: 30,
    description: 'Buka di Skor 30. Tepokan ekstra lebar!',
  },
  {
    id: 'robot',
    name: 'Tangan Robot',
    unlockScore: 60,
    description: 'Buka di Skor 60. Presisi baja anti meleset.',
  },
  {
    id: 'fire',
    name: 'Tamparan Api',
    unlockScore: 100,
    description: 'Buka di Skor 100. Jidat auto merah membara!',
  },
];

export const SCENARIOS: string[] = [
  'Gue lupa matiin kompor pas udah nyampe Bali.',
  'Niatnya mau nge-chat gebetan, malah terkirim ke grup keluarga besar.',
  'Udah dandan cakep maksimal, taunya acara nikahannya minggu depan.',
  'Minta uang kembalian ke kasir padahal barusan bayar pake QRIS.',
  'Bilang "Sama-sama" pas abang ojol bilang "Hati-hati di jalan, Mas".',
  'Ngecas HP semalaman penuh, pas pagi baru sadar saklarnya belum dicolok.',
  'Ngeluh kacamata ilang ke semua orang, padahal lagi nangkring di kepala.',
  'Nyariin HP di kolong kasur sambil nyalain senter dari HP sendiri.',
  'Udah ngunyah permen karet, eh malah ketelen pas mau buang bungkusnya.',
  'Sok akrab manggil orang dari belakang di mall, pas nengok ternyata salah orang.',
  'Bawa payung seharian pas terik, pas lupa bawa malah hujan badai.',
  'Nanya "Udah tidur?" ke temen yang jelas-jelas lagi ngorok di sebelah.',
  'Pesen es teh manis tanpa es, terus komplain ke pelayan kok gak dingin.',
  'Ngetik curhatan panjang lebar, eh ke-delete semua sebelum pencet kirim.',
  'Mandi buru-buru pake sabun cuci piring dikira body wash rasa jeruk nipis.',
  'Niat hati mau hidup hemat, malah check-out keranjang belanja jam 2 pagi.',
  'Masuk kelas kuliah udah jalan 30 menit, baru sadar salah ruangan.',
  'Antre panjang di ATM, pas giliran ternyata cuma mau cek saldo Rp 12.000.',
  'Nyalain lampu sein motor ke kiri, tapi beloknya tetep mantap ke kanan.',
  'Lupa naruh helm di spion, panik nyariin sampe nuduh tukang parkir.',
  'Buka kulkas niat ngambil minum, malah bengong 5 menit terus ditutup lagi.',
  'Pake baju kebalik seharian di kantor, baru sadar pas udah nyampe rumah.',
  'Kirim voice note ngomongin bos, eh kekirimnya ke grup kantor.',
  'Nungguin lampu merah berubah hijau, padahal itu lampu tiang hias taman.',
  'Bilang "Permisi" ke patung manekin di toko baju karena dikira pegawai.',
];

export const MISS_TAUNTS: string[] = [
  'Meleset! Jidatnya keburu licin!',
  'Angin doang yang ketepok, Bos!',
  'Kurang fokus! Kebanyakan ngopi susu ya?',
  'Waduh, malah nepuk nyamuk tetangga!',
  'Telat sekian milidetik, jidatnya lolos!',
  'Aduh! Tangannya nyasar ke kuping!',
  'Kecepatan tangan kalah sama reflek jidat!',
  'Jangan ragu-ragu, langsung PLAK aja!',
];
