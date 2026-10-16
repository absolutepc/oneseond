"""Remove only border-connected white background from supplied matching originals.
Usage: python scripts/prepare-qmg1226.py /path/to/originals
No resizing, generative processing or changes to the opaque product pixels.
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import binary_propagation, binary_dilation
root=Path(__file__).resolve().parents[1]
for ref in ('360','370'):
    im=Image.open(Path(sys.argv[1])/f'QMG1226.{ref}.jpg').convert('RGB')
    rgb=np.array(im)
    white=(rgb.min(axis=2)>=242)
    seed=np.zeros(white.shape,dtype=bool)
    seed[0,:]=white[0,:]; seed[-1,:]=white[-1,:]
    seed[:,0]=white[:,0]; seed[:,-1]=white[:,-1]
    background=binary_propagation(seed,mask=white)
    alpha=np.full(white.shape,255,dtype=np.uint8)
    alpha[background]=0
    # Soften only the one-pixel exterior rim; never touch interior highlights.
    rim=binary_dilation(background)&~background
    light=rgb.min(axis=2)
    edge=rim&(light>210)
    alpha[edge]=np.clip((255-light[edge].astype(float))*255/45,0,255).astype(np.uint8)
    # Protect the polished case: its white reflections touch the white backdrop.
    # This interior contour keeps those highlights opaque instead of keying them out.
    protected=Image.new('L', im.size, 0)
    ImageDraw.Draw(protected).polygon([(53,118),(228,118),(245,147),(259,181),(268,221),(274,260),(274,317),(270,354),(262,393),(250,429),(231,450),(54,450),(29,421),(15,385),(6,346),(1,320),(1,266),(4,235),(10,204),(20,168),(36,139)],fill=255)
    alpha[np.array(protected)>0]=255
    result=Image.fromarray(np.dstack((rgb,alpha)))
    out=root/'public/assets/catalog'/f'qmg1226-{ref}.webp'
    result.save(out,'WEBP',lossless=True,exact=True,method=6)
    saved=np.array(Image.open(out).convert('RGBA'))
    assert saved.shape[:2]==rgb.shape[:2]
    assert np.array_equal(saved[:,:,:3][alpha==255],rgb[alpha==255])
    preview=Image.new('RGBA',im.size,'#101827');preview.alpha_composite(result)
    preview.convert('RGB').save(f'/tmp/qmg1226-{ref}-check.png')
    print(ref,im.size,'opaque product pixels unchanged',out.stat().st_size)
