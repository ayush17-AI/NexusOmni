$ErrorActionPreference = "Continue"
echo "Adding GOOGLE_API_KEY to Vercel..."
echo "AIzaSyB1_VKfVc5nT49dSyo_GDgoKxKtV67KDdw" | npx -y vercel env add GOOGLE_API_KEY production
echo "Triggering production deployment..."
npx -y vercel --prod --yes
