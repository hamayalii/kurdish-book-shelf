# Kurdish Book Display

I have uploaded a ZIP archive containing two types of real images for my

Kurdish books:

1. Front-cover images for the large book detail view.

2. Spine images for displaying the books on the virtual bookshelf.

Please:

1. Extract the ZIP archive.

2. Match every image to the correct book using its filename and the title or

   ISBN in kurdish_books.csv.

3. Clearly separate front-cover images from spine images.

4. Copy all matched images into the project's public assets folder.

5. Add the correct front-cover image path and spine image path to each

   corresponding book object.

6. Use the original front-cover image in the large detail view after a book

   is clicked.

7. Use the original spine image on the bookshelf before a book is clicked.

8. Do not generate, redraw, redesign, reconstruct, or replace the spine images.

   The uploaded spine images are the final real spine assets.

9. Preserve every Kurdish Sorani title, author name, and translator name exactly

   as written in kurdish_books.csv.

10. Do not translate, rewrite, abbreviate, regenerate, or modify any text on

    the uploaded front covers or spine images.

11. Keep the original aspect ratio of every image. Do not stretch or distort

    the front covers or spines.

12. Use object-fit: contain where appropriate so the complete book cover or

    spine remains visible.

13. If a filename cannot be matched confidently to a book, do not guess.

    Leave that image unassigned and report its filename.

14. If a book has no matching front cover or no matching spine, leave that

    asset empty and report which asset is missing.

TRANSPARENT SPINE REQUIREMENTS:

15. The uploaded spine images must have a fully transparent background outside

    the physical book spine.

16. Remove any white, gray, black, or colored background surrounding the spine.

17. Preserve only the isolated physical spine, including its original colors,

    texture, typography, ornaments, and natural edges.

18. Export or process the spine assets as transparent PNG files with an alpha

    channel, not as JPG files with a fake solid background.

19. Do not remove any part of the actual spine design or crop important text.

20. Do not add shelves, hands, front covers, back covers, mockup scenes, or

    unrelated shadows around the spine.

21. The bookshelf background must remain visible around and behind each

    transparent spine.

SHELF INTERACTION:

22. Initially show the books as narrow 3D spine objects on the shelf using the

    uploaded transparent spine images.

23. When a user clicks a spine, animate that book forward and reveal the

    matching original front-cover image in a large detail view.

24. Keep the bookshelf softly blurred or dimmed behind the selected book.

25. Do not use placeholder books or invented images.

26. Do not use AI-generated covers or AI-generated spines when a real uploaded

    asset is available.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c88af733-5087-4741-bc63-3acffa469a8b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
