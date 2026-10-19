// Foto crua de celular tem 4–8 MB; no mercado, pelo 4G, isso não sobe.
// Reduz no próprio aparelho e gera duas versões JPEG:
// - foto: lado maior até 1280px, para a visualização em tela cheia;
// - mini: quadrado 160px recortado no centro, para a miniatura da linha.
// O <img> já aplica a orientação EXIF ao decodificar, então o canvas
// recebe a foto em pé.

const PHOTO_MAX_SIDE = 1280;
const MINI_SIDE = 160;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não consegui abrir essa imagem"));
    };
    img.src = url;
  });
}

function toJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Falha ao converter a foto")),
      "image/jpeg",
      quality,
    );
  });
}

export async function resizePhoto(
  file: File,
): Promise<{ photo: Blob; mini: Blob }> {
  const img = await loadImage(file);
  const w = img.naturalWidth;
  const h = img.naturalHeight;

  const scale = Math.min(1, PHOTO_MAX_SIDE / Math.max(w, h));
  const full = document.createElement("canvas");
  full.width = Math.round(w * scale);
  full.height = Math.round(h * scale);
  full.getContext("2d")!.drawImage(img, 0, 0, full.width, full.height);

  const side = Math.min(w, h);
  const mini = document.createElement("canvas");
  mini.width = MINI_SIDE;
  mini.height = MINI_SIDE;
  mini
    .getContext("2d")!
    .drawImage(
      img,
      (w - side) / 2,
      (h - side) / 2,
      side,
      side,
      0,
      0,
      MINI_SIDE,
      MINI_SIDE,
    );

  return {
    photo: await toJpeg(full, 0.82),
    mini: await toJpeg(mini, 0.8),
  };
}
