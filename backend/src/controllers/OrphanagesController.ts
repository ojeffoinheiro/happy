import { Request, Response } from 'express'
import { getRepository } from 'typeorm'
import * as Yup from 'Yup'

import orphanages_view from '../views/orphanages_view'
import Orphanage from '../models/Orphanesge';

export default {
    async index(req: Request, res: Response){
        const orphanagesRepository = getRepository(Orphanage);
        const orphanages = await orphanagesRepository.find({
            relations: ['images']
        });

        return res.json(orphanages_view.renderMany(orphanages));
    },
    async show(req: Request, res: Response){
        const { id } = req.params;
        const orphanagesRepository = getRepository(Orphanage);
        const orphanage = await orphanagesRepository.findOneOrFail(id, {
            relations: ['images']
        });

        return res.json(orphanages_view.render(orphanage));
    },
    async create(req: Request, res: Response) {
        console.log(req.files);
        const {
            name,
            latitude,
            long,
            about,
            instructions,
            opening_hours,
            open_on_weekends
        } = req.body
    
        const orphanagesRepository = getRepository(Orphanage);
        const requestImages = req.files as Express.Multer.File[] ;
        const images = requestImages.map(image => {
            return{path: image.filename}
        })

        const data = {
            name,
            latitude,
            long,
            about,
            instructions,
            opening_hours,
            open_on_weekends: open_on_weekends === 'true' ,
            images
        }

        const schema = Yup.object().shape({
            name: Yup.string().required('Nome é um campo obrigatório'),
            latitude: Yup.number().required(),
            long: Yup.number().required(),
            about: Yup.string().required().max(300),
            instructions: Yup.string().required(),
            opening_hours: Yup.string().required(),
            open_on_weekends: Yup.boolean().required(),
            images: Yup.array(
                Yup.object().shape({
                    path: Yup.string().required()
            }))
        });

        const finalData = schema.cast(data);

        await schema.validate(data, {
            abortEarly: false,
        })

        const orphanage = orphanagesRepository.create(data);
    
        await orphanagesRepository.save(orphanage)
    
        return res.status(201).json(orphanage)
    }
};