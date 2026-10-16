"""Remove only border-connected white background from supplied matching originals.
Usage: python scripts/prepare-pwg1014.py /path/to/originals
No resizing, generative processing or changes to the opaque product pixels.
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import binary_propagation, binary_dilation
root=Path(__file__).resolve().parents[1]
for ref in ('075','375','499'):
    im=Image.open(Path(sys.argv[1])/f'PWG1014.{ref}.jpg').convert('RGB')
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
    result=Image.fromarray(np.dstack((rgb,alpha)))
    out=root/'public/assets/catalog'/f'pwg1014-{ref}.webp'
    result.save(out,'WEBP',lossless=True,exact=True,method=6)
    saved=np.array(Image.open(out).convert('RGBA'))
    assert saved.shape[:2]==rgb.shape[:2]
    assert np.array_equal(saved[:,:,:3][alpha==255],rgb[alpha==255])
    preview=Image.new('RGBA',im.size,'#101827');preview.alpha_composite(result)
    preview.convert('RGB').save(f'/tmp/pwg1014-{ref}-check.png')
    print(ref,im.size,'opaque product pixels unchanged',out.stat().st_size)
