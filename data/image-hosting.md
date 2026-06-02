# KBO Image Hosting

KBO team and player images are stored in S3 and served through CloudFront.

## AWS Resources

- S3 bucket: managed outside this repository
- S3 region: managed outside this repository
- CloudFront distribution: managed outside this repository
- CloudFront OAC: managed outside this repository

S3 public access is blocked. Objects should be read through CloudFront only.

## Object Key Rule

Database image path columns store only the object key, without the CDN base URL.

Team logo:

```text
data/images/{team}/{team}.png
```

Player profile image:

```text
data/images/{team}/players/{player_name}.png
```

Examples:

```text
data/images/LG/LG.png
data/images/한화/players/류현진.png
```

Frontend code should prepend the CloudFront base URL and URL-encode the path:

```ts
const CDN_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_CDN_BASE_URL

export function toImageUrl(path?: string | null) {
  if (!path || !CDN_BASE_URL) return undefined
  return `${CDN_BASE_URL}/${encodeURI(path)}`
}
```

## Upload

Images are generated locally under `data/images/`, but that directory is ignored by git.

Use the script below to download/regenerate local images:

```bash
node data/download_kbo_images.mjs
```

When uploading from macOS, normalize S3 keys to NFC so they match the Korean paths stored in SQL.

```bash
IMAGE_ASSET_BUCKET="<bucket-name>" node -e 'const fs=require("fs"); const path=require("path"); const {spawnSync}=require("child_process"); const root="data/images"; const bucket=process.env.IMAGE_ASSET_BUCKET; if(!bucket){ throw new Error("IMAGE_ASSET_BUCKET is required"); } function walk(dir){ return fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>{ const p=path.join(dir,d.name); return d.isDirectory()?walk(p):[p]; }); } const files=walk(root).filter(p=>p.endsWith(".png")); let ok=0; const failed=[]; for (const file of files){ const rel=file.split(path.sep).join("/").normalize("NFC"); const dest=`s3://${bucket}/${rel}`; const r=spawnSync("aws",["s3","cp",file,dest,"--cache-control","public, max-age=31536000, immutable","--content-type","image/png","--only-show-errors"],{encoding:"utf8"}); if(r.status===0){ ok++; } else { failed.push({file,dest,error:(r.stderr||r.stdout).trim()}); } } console.log(JSON.stringify({total:files.length, ok, failed}, null, 2));'
```

Expected current count:

```text
299 PNG objects
```

## Verification

Count uploaded objects:

```bash
aws s3 ls "s3://${IMAGE_ASSET_BUCKET}/data/images" --recursive --summarize
```

Check a CloudFront URL:

```bash
curl -I "${IMAGE_CDN_BASE_URL}/data/images/%ED%95%9C%ED%99%94/players/%EB%A5%98%ED%98%84%EC%A7%84.png"
```

Expected result:

```text
HTTP/2 200
content-type: image/png
cache-control: public, max-age=31536000, immutable
```

Check that direct S3 public access is blocked:

```bash
curl -I "https://${IMAGE_ASSET_BUCKET}.s3.${AWS_REGION}.amazonaws.com/data/images/%ED%95%9C%ED%99%94/players/%EB%A5%98%ED%98%84%EC%A7%84.png"
```

Expected result:

```text
HTTP/1.1 403 Forbidden
```

## Notes

- CloudFront uses OAC to access the private S3 bucket.
- The S3 bucket policy should allow `s3:GetObject` only from the CloudFront distribution ARN.
- Custom domain and ACM certificate are not configured yet.
- DB paths should remain unencoded Korean strings. Encode only when building the final frontend URL.
