'use client';

import { useState } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useFirebaseApp } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { UploadCloud, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ImageUploadProps {
  userId?: string;
  currentImageUrl?: string | null;
  onUploadComplete: (url: string) => void;
}

export function ImageUpload({ userId, currentImageUrl, onUploadComplete }: ImageUploadProps) {
  const app = useFirebaseApp();
  const { toast } = useToast();

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) {
      return;
    }

    if (!file.type.startsWith('image/')) {
        toast({
            variant: 'destructive',
            title: 'Invalid File Type',
            description: 'Please select an image file.',
        });
        return;
    }

    const storage = getStorage(app);
    const fileId = uuidv4();
    const fileExtension = file.name.split('.').pop();
    const storagePath = `profile_images/${userId}/${fileId}.${fileExtension}`;
    const storageRef = ref(storage, storagePath);

    const uploadTask = uploadBytesResumable(storageRef, file);

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);

    setIsUploading(true);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        setIsUploading(false);
        setUploadProgress(null);
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: 'There was an error uploading your image. Please check your network and security rules.',
        });
        console.error('Upload error:', error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          onUploadComplete(downloadURL);
          setPreviewUrl(downloadURL);
          setIsUploading(false);
          setUploadProgress(null);
          toast({
            title: 'Upload Successful',
            description: 'Your new profile picture has been saved.',
          });
        });
      }
    );
  };
  
  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onUploadComplete('');
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={previewUrl || undefined} alt="Profile preview" />
          <AvatarFallback className="text-3xl">
            <UploadCloud />
          </AvatarFallback>
        </Avatar>
        {previewUrl && (
             <Button 
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-7 w-7 rounded-full"
                onClick={handleRemoveImage}
            >
                <X className="h-4 w-4" />
            </Button>
        )}
      </div>
      
      <div className="flex-grow space-y-2">
        <Button asChild variant="outline">
          <label htmlFor="file-upload" className="cursor-pointer">
            <UploadCloud className="mr-2 h-4 w-4" />
            Choose Image
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
              disabled={isUploading || !userId}
            />
          </label>
        </Button>
        {!userId && <p className="text-xs text-destructive">User not found. Cannot upload.</p>}
        {isUploading && uploadProgress !== null && (
            <div className="space-y-1">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">{Math.round(uploadProgress)}% uploaded</p>
            </div>
        )}
      </div>
    </div>
  );
}
