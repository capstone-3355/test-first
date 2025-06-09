import express from 'express';
import {
    saveWord,
    getSavedSentences,
    deleteSavedWord
} from '../controllers/savedController.js';

const router = express.Router();

router.post('/save-word', saveWord);
router.get('/review', getSavedSentences);
router.delete('/delete-word', deleteSavedWord);

export default router;
