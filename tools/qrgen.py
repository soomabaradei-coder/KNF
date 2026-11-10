# Minimal QR encoder (byte mode), after Nayuki's qrcodegen algorithm. Usage: python3 qrgen.py "text" out.png
import sys
from PIL import Image

ECC_CODEWORDS_PER_BLOCK = {  # [L, M, Q, H] per version index
 'L':[-1,7,10,15,20,26,18,20,24,30,18,20,24,26,30,22,24,28,30,28,28],
 'M':[-1,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26],
}
NUM_ERROR_CORRECTION_BLOCKS = {
 'L':[-1,1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7,8],
 'M':[-1,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16],
}
FORMAT_BITS = {'L':1,'M':0}

def num_raw_data_modules(ver):
    result=(16*ver+128)*ver+64
    if ver>=2:
        numalign=ver//7+2
        result-=(25*numalign-10)*numalign-55
        if ver>=7: result-=36
    return result

def num_data_codewords(ver,ecl):
    return num_raw_data_modules(ver)//8 - ECC_CODEWORDS_PER_BLOCK[ecl][ver]*NUM_ERROR_CORRECTION_BLOCKS[ecl][ver]

def rs_mul(x,y):
    z=0
    for i in reversed(range(8)):
        z=(z<<1)^((z>>7)*0x11D)
        z^=((y>>i)&1)*x
    return z

def rs_divisor(degree):
    result=[0]*(degree-1)+[1]
    root=1
    for _ in range(degree):
        for j in range(len(result)):
            result[j]=rs_mul(result[j],root)
            if j+1<len(result): result[j]^=result[j+1]
        root=rs_mul(root,0x02)
    return result

def rs_remainder(data,divisor):
    result=[0]*len(divisor)
    for b in data:
        factor=b^result.pop(0)
        result.append(0)
        for i,coef in enumerate(divisor):
            result[i]^=rs_mul(coef,factor)
    return result

def encode(text,ecl='M'):
    data=text.encode('utf-8')
    for ver in range(1,21):
        cap=num_data_codewords(ver,ecl)*8
        ccbits=8 if ver<=9 else 16
        used=4+ccbits+len(data)*8
        if used<=cap: break
    else: raise ValueError('too long')
    bits=[]
    def app(val,n):
        for i in reversed(range(n)): bits.append((val>>i)&1)
    app(0b0100,4); app(len(data),ccbits)
    for b in data: app(b,8)
    app(0,min(4,cap-len(bits)))
    app(0,(-len(bits))%8)
    pad=0xEC
    while len(bits)<cap:
        app(pad,8); pad^=0xEC^0x11
    datacw=[int(''.join(map(str,bits[i:i+8])),2) for i in range(0,len(bits),8)]
    # blocks + ecc
    numblocks=NUM_ERROR_CORRECTION_BLOCKS[ecl][ver]; blockecclen=ECC_CODEWORDS_PER_BLOCK[ecl][ver]
    rawcw=num_raw_data_modules(ver)//8
    numshort=numblocks-rawcw%numblocks; shortlen=rawcw//numblocks
    blocks=[]; div=rs_divisor(blockecclen); k=0
    for i in range(numblocks):
        dat=datacw[k:k+shortlen-blockecclen+(0 if i<numshort else 1)]; k+=len(dat)
        ecc=rs_remainder(dat,div)
        if i<numshort: dat=dat+[0]
        blocks.append(dat+ecc)
    final=[]
    for i in range(len(blocks[0])):
        for j,blk in enumerate(blocks):
            if i!=shortlen-blockecclen or j>=numshort: final.append(blk[i])
    # matrix
    size=ver*4+17
    mod=[[False]*size for _ in range(size)]; fn=[[False]*size for _ in range(size)]
    def setf(x,y,d): mod[y][x]=d; fn[y][x]=True
    for i in range(size): setf(6,i,i%2==0); setf(i,6,i%2==0)
    def finder(x,y):
        for dy in range(-4,5):
            for dx in range(-4,5):
                xx,yy=x+dx,y+dy
                if 0<=xx<size and 0<=yy<size:
                    d=max(abs(dx),abs(dy)); setf(xx,yy,d!=2 and d!=4)
    finder(3,3); finder(size-4,3); finder(3,size-4)
    if ver>1:
        n=ver//7+2; step=(ver*8+n*3+5)//(n*4-4)*2
        pos=[6]+[size-7-i*step for i in range(n-1)][::-1]
        for i in range(n):
            for j in range(n):
                if (i==0 and j==0) or (i==0 and j==n-1) or (i==n-1 and j==0): continue
                for dy in range(-2,3):
                    for dx in range(-2,3): setf(pos[i]+dx,pos[j]+dy,max(abs(dx),abs(dy))!=1)
    def draw_format(mask):
        data=FORMAT_BITS[ecl]<<3|mask; rem=data
        for _ in range(10): rem=(rem<<1)^((rem>>9)*0x537)
        b=(data<<10|rem)^0x5412
        g=lambda i:((b>>i)&1)!=0
        for i in range(0,6): setf(8,i,g(i))
        setf(8,7,g(6)); setf(8,8,g(7)); setf(7,8,g(8))
        for i in range(9,15): setf(14-i,8,g(i))
        for i in range(0,8): setf(size-1-i,8,g(i))
        for i in range(8,15): setf(8,size-15+i,g(i))
        setf(8,size-8,True)
    draw_format(0)
    if ver>=7:
        rem=ver
        for _ in range(12): rem=(rem<<1)^((rem>>11)*0x1F25)
        b=ver<<12|rem
        for i in range(18):
            bit=((b>>i)&1)!=0; a=size-11+i%3; c=i//3
            setf(a,c,bit); setf(c,a,bit)
    # data placement
    i=0; right=size-1
    allbits=[(final[j>>3]>>(7-(j&7)))&1 for j in range(len(final)*8)]
    while right>=1:
        if right==6: right=5
        for vert in range(size):
            for jj in range(2):
                x=right-jj; upward=((right+1)&2)==0
                y=size-1-vert if upward else vert
                if not fn[y][x] and i<len(allbits):
                    mod[y][x]=allbits[i]==1; i+=1
        right-=2
    MASKS=[lambda x,y:(x+y)%2==0,lambda x,y:y%2==0,lambda x,y:x%3==0,lambda x,y:(x+y)%3==0,
           lambda x,y:(x//3+y//2)%2==0,lambda x,y:x*y%2+x*y%3==0,lambda x,y:(x*y%2+x*y%3)%2==0,lambda x,y:((x+y)%2+x*y%3)%2==0]
    def apply(m):
        for y in range(size):
            for x in range(size):
                if not fn[y][x] and MASKS[m](x,y): mod[y][x]=not mod[y][x]
    def penalty():
        p=0
        for rows in (mod,[list(c) for c in zip(*mod)]):
            for row in rows:
                run=1
                for x in range(1,size):
                    if row[x]==row[x-1]: run+=1
                    else:
                        if run>=5: p+=run-2
                        run=1
                if run>=5: p+=run-2
                s=''.join('1' if v else '0' for v in row)
                p+=40*(s.count('10111010000')+s.count('00001011101'))
        for y in range(size-1):
            for x in range(size-1):
                c=mod[y][x]
                if c==mod[y][x+1]==mod[y+1][x]==mod[y+1][x+1]: p+=3
        dark=sum(v for r in mod for v in r); total=size*size
        p+=(abs(dark*20-total*10)//total)*10
        return p
    best=None
    for m in range(8):
        apply(m); draw_format(m); pen=penalty()
        if best is None or pen<best[0]: best=(pen,m)
        apply(m)
    apply(best[1]); draw_format(best[1])
    return mod,ver

def save(mod,path,scale=24,border=4,dark=(10,79,76),light=(251,248,241)):
    n=len(mod); img=Image.new('RGB',((n+2*border)*scale,)*2,light); px=img.load()
    for y in range(n):
        for x in range(n):
            if mod[y][x]:
                for yy in range((y+border)*scale,(y+border+1)*scale):
                    for xx in range((x+border)*scale,(x+border+1)*scale): px[xx,yy]=dark
    img.save(path)

if __name__=='__main__':
    m,v=encode(sys.argv[1],'M'); save(m,sys.argv[2]); print('version',v,'size',len(m))
