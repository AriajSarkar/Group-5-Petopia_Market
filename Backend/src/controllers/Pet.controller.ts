import Pets from '../models/Pets.model.js';
import { APIError } from '../utils/APIError.util.js';
import { APIResponse } from '../utils/APIResponse.util.js';
import AsyncHandler from '../utils/AsyncHandler.util.js';
import { uploadOnCloudinary } from '../utils/Cloudinary.util.js';
import { CloudinaryImage, IGetUserAuthInfoRequest } from '../types/model/user.type.js';
import { RequestHandler, Response, Request } from 'express';

// This Controller add's Detail of Pet in Pet Controller
const addPet = AsyncHandler(async (req: IGetUserAuthInfoRequest, res: Response) => {
  const petImage: CloudinaryImage[] = [];
  try {
    const { petName, petDescription, price, isFree, petType, petBread, diseases } = req.body;

    // checking for required fields
    if ([petName, petBread, petDescription, price, petType].some((val) => val?.trim() === '')) {
      return res.status(402).json(new APIError('Required Fields are Missing', 402));
    }

    const petImages = req.files;

    // Checking Condition for Minimum one Image is Required
    if (!petImages || !Array.isArray(petImages) || petImages.length < 1) {
      return res.status(402).json(new APIError('At Least one Image of Pet is Required', 402));
    }

    // Iterating over each uploaded file and uploading them to Cloudinary
    for (const file of petImages) {
      const localPath: string = file?.path;
      const response = await uploadOnCloudinary(localPath);
      if (response?.url) {
        petImage.push({ url: response.url, publicId: response.public_id });
      }
    }

    const addNewPet = await Pets.create({
      petName,
      petDescription,
      price,
      isFree,
      petType,
      petBread,
      petImages: petImage,
      diseases,
      owner: req.user?._id,
    });

    if (!addNewPet) {
      return res.status(501).json(new APIError('Failed to Add Pet', 501));
    }

    res.status(200).json(new APIResponse('Pet Details Added Successfully', 200, addNewPet));
  } catch (error: any) {
    console.log('Errro while Adding Pet');
    res.status(502).json(new APIError(error?.message, 502, error));
  }
});

// This Controller Retrieve all Pets Details
const getAllPets = AsyncHandler(async (_, res: Response) => {
  try {
    // Retrieve all Available Pets
    const pets = await Pets.find();

    res.status(200).json(new APIResponse('All Pets Retrieved Successfully', 200, pets));
  } catch (error: any) {
    console.log('Error while retrieving pets:', error.message);
    res.status(500).json(new APIError('Failed to retrieve pets', 500, error));
  }
});

// This Controller helps to get Pet Details by Id
const getPetById: RequestHandler = AsyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Checking Availability of id in params
    if (!id) {
      return res.status(402).json(new APIError('Parameter id is Missing', 402));
    }

    const pet = await Pets.findById(id);

    if (!pet) {
      return res.status(404).json(new APIError('Pet not found', 404));
    }

    res.status(200).json(new APIResponse('Pet Retrieved Successfully', 200, pet));
  } catch (error: any) {
    console.log('Error while retrieving pet by ID:', error.message);
    res.status(500).json(new APIError('Failed to retrieve pet', 500, error));
  }
});

// This Controller Delete Pet Details by id
const deletePetById = AsyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(402).json(new APIError('Parameter id is Missing', 402));
    }
    const petDetails = await Pets.findById(id);

    if (!petDetails) {
      return res.status(402).json(new APIError('No Pet Found with Given Credentials', 402));
    }

    await petDetails.deleteImages();

    const deletedPet = await Pets.findByIdAndDelete(id);

    if (!deletedPet) {
      return res.status(404).json(new APIError('Pet not found', 404));
    }

    res.status(200).json(new APIResponse('Pet Deleted Successfully', 200, deletedPet));
  } catch (error: any) {
    console.log('Error while deleting pet by ID:', error.message);
    res.status(500).json(new APIError('Failed to delete pet', 500, error));
  }
});

// This controller Help's to Edit Details of Pet
const updatePetDetails = AsyncHandler(async (req: IGetUserAuthInfoRequest, res: Response) => {
  let petsImageUrl: CloudinaryImage[] = [];
  try {
    const { petName, petDescription, price, isFree, petType, petBreed, diseases } = req.body;
    const { id } = req.params;

    const petDetails = await Pets.findById(id);

    if (!petDetails) {
      return res.status(402).json(new APIError('Pet Not Exist with given Id', 402));
    }

    // Checking for condition of Only Owner Can Edit Details of Pet
    if (petDetails && req.user && String(petDetails.owner) != req.user._id) {
      return res.status(402).json(new APIError('You are Not owner of this Pet', 402));
    }

    if (!id) {
      return res.status(402).json(new APIError('Parameter id is Missing', 402));
    }

    // Basic validation checks
    if (!petName || !petDescription || !price || !petType) {
      return res.status(400).json(new APIError('Missing required fields', 400));
    }

    const petImages = req.files;

    // if Images are altered then and then only updating image
    if (petImages && Array.isArray(petImages)) {
      // Iterating over each uploaded file and uploading them to Cloudinary
      for (const file of petImages) {
        const localPath: string = file?.path;
        const response = await uploadOnCloudinary(localPath);
        if (response?.url) {
          petsImageUrl.push({ url: response.url, publicId: response.public_id });
        }
      }
    }

    if (petsImageUrl.length < 1 && petDetails?.petImages) {
      petsImageUrl = petDetails?.petImages;
    }

    const updatedPet = await Pets.findByIdAndUpdate(
      id,
      {
        petName,
        petDescription,
        price,
        isFree,
        petType,
        petBreed,
        diseases,
        petImages: petsImageUrl,
      },
      { new: true },
    );

    if (!updatedPet) {
      return res.status(404).json(new APIError('Pet Update Failed', 404));
    }

    res.status(200).json(new APIResponse('Pet Details Updated Successfully', 200, updatedPet));
  } catch (error: any) {
    console.log('Error while updating pet details:', error.message);
    res.status(500).json(new APIError('Failed to update pet details', 500, error));
  }
});

// Following Controller change Status of Pet is Adopted or not?
const buyPet = AsyncHandler(async (req: IGetUserAuthInfoRequest, res: Response) => {
  try {
    const { id } = req.params;

    const PetDetails = await Pets.findById(id);

    // Checking Existence of Pet Details
    if (!PetDetails) {
      return res.status(402).json(new APIError("Pet with Provided Details Doesn't Exist", 402));
    }

    // Checking Condition of Pet Owner can't Adopt his own Pet
    if (PetDetails && req.user && String(PetDetails.owner) != req.user._id) {
      return res.status(402).json(new APIError("You Can't Adopt Your own Pet", 402));
    }

    const updatePetAdoptStatus = await Pets.findByIdAndUpdate(id, { isAdopted: true });

    // Checking if any server side issue in update status
    if (!updatePetAdoptStatus) {
      return res.status(502).json(new APIError('Failed to Update the Status of Pet Adoption Sorry', 502));
    }

    res.status(200).json(new APIResponse('Pet is Adopted Successfully', 200, updatePetAdoptStatus));
  } catch (error: any) {
    console.log(error);
    res.status(500).json(new APIError('Failed to update pet details', 500, error));
  }
});

export { addPet, getAllPets, getPetById, deletePetById, updatePetDetails, buyPet };
