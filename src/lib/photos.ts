import { supabase } from './supabase';

export interface PhotoUploadData {
  file: File;
  matchId?: string;
  title?: string;
  description?: string;
  uploadedBy?: string;
  [key: string]: any;
}

export interface PhotoRecord {
  id: string;
  image_url?: string;
  caption?: string;
  created_at?: string;
  url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  match_id?: string;
  title?: string;
  description?: string;
  uploaded_by?: string;
  uploaded_at: string;
  storage_path?: string;
  [key: string]: any;
}

export interface UploadPhotoResponse {
  success: boolean;
  message: string;
  data?: PhotoRecord;
  error?: string;
  url?: string;
}

export interface FetchPhotosResponse {
  success: boolean;
  message: string;
  data?: PhotoRecord[];
  error?: string;
}

/**
 * Upload a photo to Supabase Storage and save metadata to 'photos' table
 */
export async function uploadPhoto(photoData: PhotoUploadData): Promise<UploadPhotoResponse> {
  try {
    // Validate file
    if (!photoData.file) {
      return {
        success: false,
        message: 'No file provided',
        error: 'File is required',
      };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(photoData.file.type)) {
      return {
        success: false,
        message: 'Invalid file type',
        error: 'Only JPEG, PNG, GIF, and WebP images are allowed',
      };
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (photoData.file.size > maxSize) {
      return {
        success: false,
        message: 'File too large',
        error: 'File size must be less than 5MB',
      };
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: 'Authentication required',
        error: 'User must be logged in to upload photos',
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = photoData.file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;
    const filePath = `${user.id}/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(filePath, photoData.file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return {
        success: false,
        message: 'Failed to upload photo',
        error: uploadError.message || 'Storage error occurred',
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('photos')
      .getPublicUrl(uploadData.path);

    const publicUrl = urlData.publicUrl;

    const normalizedCaption = photoData.matchId
      ? `[match:${photoData.matchId}] ${photoData.title || photoData.file.name}`
      : (photoData.title || photoData.file.name);

    // Save metadata to 'photos' table (real schema: image_url, caption, created_at)
    const { data: photoRecord, error: dbError } = await supabase
      .from('photos')
      .insert([
        {
          image_url: publicUrl,
          caption: normalizedCaption,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('photos').remove([uploadData.path]);
      return {
        success: false,
        message: 'Failed to save photo metadata',
        error: dbError.message || 'Database error occurred',
      };
    }

    const mappedRecord = mapPhotoRecord(photoRecord);
    return {
      success: true,
      message: 'Photo uploaded successfully',
      data: mappedRecord,
      url: publicUrl,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error('Upload error:', errorMessage);
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: errorMessage,
    };
  }
}

/**
 * Upload multiple photos
 */
export async function uploadPhotos(
  files: File[],
  matchId?: string
): Promise<UploadPhotoResponse> {
  try {
    if (!files || files.length === 0) {
      return {
        success: false,
        message: 'No files provided',
        error: 'At least one file is required',
      };
    }

    const uploadPromises = files.map((file) =>
      uploadPhoto({
        file,
        matchId,
      })
    );

    const results = await Promise.all(uploadPromises);
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    if (failureCount > 0) {
      return {
        success: false,
        message: `${successCount} photos uploaded, ${failureCount} failed`,
        error: `Some uploads failed`,
      };
    }

    return {
      success: true,
      message: `${successCount} photos uploaded successfully`,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return {
      success: false,
      message: 'Batch upload failed',
      error: errorMessage,
    };
  }
}

/**
 * Fetch all photos
 */
export async function fetchPhotos(): Promise<FetchPhotosResponse> {
  try {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return {
        success: false,
        message: 'Failed to fetch photos',
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Photos fetched successfully',
      data: ((data as any[]) || []).map(mapPhotoRecord),
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return {
      success: false,
      message: 'Failed to fetch photos',
      error: errorMessage,
    };
  }
}

/**
 * Fetch photos by match ID
 */
export async function fetchPhotosByMatch(matchId: string): Promise<FetchPhotosResponse> {
  try {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .ilike('caption', `[match:${matchId}]%`)
      .order('created_at', { ascending: false });

    if (error) {
      return {
        success: false,
        message: 'Failed to fetch match photos',
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Match photos fetched successfully',
      data: ((data as any[]) || []).map(mapPhotoRecord),
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return {
      success: false,
      message: 'Failed to fetch match photos',
      error: errorMessage,
    };
  }
}

/**
 * Delete a photo from storage and database
 */
export async function deletePhoto(photoId: string, storagePath: string): Promise<UploadPhotoResponse> {
  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: 'Authentication required',
        error: 'User must be logged in',
      };
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('photos')
      .remove([storagePath]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
      // Continue with database deletion even if storage delete fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId);

    if (dbError) {
      return {
        success: false,
        message: 'Failed to delete photo',
        error: dbError.message,
      };
    }

    return {
      success: true,
      message: 'Photo deleted successfully',
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return {
      success: false,
      message: 'Failed to delete photo',
      error: errorMessage,
    };
  }
}

/**
 * Update photo metadata
 */
export async function updatePhotoMetadata(
  photoId: string,
  updates: Partial<PhotoRecord>
): Promise<UploadPhotoResponse> {
  try {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.caption = updates.title;
    if (updates.caption !== undefined) dbUpdates.caption = updates.caption;
    if (updates.url !== undefined) dbUpdates.image_url = updates.url;
    if (updates.image_url !== undefined) dbUpdates.image_url = updates.image_url;

    const { data, error } = await supabase
      .from('photos')
      .update(dbUpdates)
      .eq('id', photoId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        message: 'Failed to update photo',
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Photo updated successfully',
      data: mapPhotoRecord(data),
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return {
      success: false,
      message: 'Failed to update photo',
      error: errorMessage,
    };
  }
}

function mapPhotoRecord(row: any): PhotoRecord {
  const imageUrl = row?.image_url || row?.url || "";
  const caption = row?.caption || "";
  const matchIdMatch = typeof caption === "string" ? caption.match(/^\[match:([^\]]+)\]\s*/i) : null;
  const matchId = matchIdMatch?.[1];
  const title = typeof caption === "string" ? caption.replace(/^\[match:[^\]]+\]\s*/i, "") : "";
  const storagePathMatch = typeof imageUrl === "string"
    ? imageUrl.match(/\/storage\/v1\/object\/public\/photos\/(.+)$/)
    : null;

  return {
    id: row?.id,
    image_url: imageUrl,
    caption,
    created_at: row?.created_at,
    url: imageUrl,
    file_name: title || "photo",
    file_size: 0,
    file_type: "image/*",
    match_id: matchId,
    title,
    description: "",
    uploaded_by: undefined,
    uploaded_at: row?.created_at || new Date().toISOString(),
    storage_path: storagePathMatch?.[1] || "",
  };
}
