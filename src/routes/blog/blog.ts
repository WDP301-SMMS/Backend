import { BlogController } from '@/controllers/blog/blog.controller';
import { RoleEnum } from '@/enums/RoleEnum';
import { handleToken, roleBaseAccess } from '@/middlewares/security/authorization';
import { createBlogValidator, updateBlogValidator } from '@/validators/blog/blog.validator';
import { Router } from 'express';



const router = Router();
const controller = new BlogController();

router.get('/', controller.getAllPosts);

router.post('/',
  createBlogValidator,
  handleToken,
  roleBaseAccess([RoleEnum.Manager]),
  controller.createPost
);

router.get('/:id', controller.getPostById);

router.patch(
  '/:id',
  updateBlogValidator,
  handleToken,
  roleBaseAccess([RoleEnum.Manager]),
  controller.updatePost,
);

router.delete(
  '/:id',
  handleToken,
  roleBaseAccess([RoleEnum.Manager]),
  controller.deletePost,
);

export default router;