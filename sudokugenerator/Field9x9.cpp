#include "Field9x9.h"

#include <random>
#include <algorithm>

int Field9x9::ProgramId = 0;

Field9x9::Field9x9() : id{ Field9x9::ProgramId++ } {
	int solvable = 0;
	this->fillDiagonals();

	// set/reset helpers
	this->usedInRow = std::array<std::bitset<10>, 9>(); // reset usedInRow
	this->usedInCol = std::array<std::bitset<10>, 9>(); // reset usedInCol
	this->usedInGrid = std::array<std::array<std::bitset<10>, 3>, 3>(); // reset usedInGrid
	this->initBitsets();

	this->solveAllPaths(0, 0, solvable);
	this->perfectSolution = this->arr;
	this->mask();
}

Field9x9::Field9x9(const Field9x9& copy) : id{ Field9x9::ProgramId++ } {
	this->arr = copy.arr;
	this->perfectSolution = copy.perfectSolution;
}

Field9x9& Field9x9::operator=(const Field9x9& other) {
	if (this != &other) { // protect against self-assignment
		this->arr = other.arr;
		this->perfectSolution = other.perfectSolution;
	}
	return *this;
}

void Field9x9::Print() const {
	// go over every row
	for (size_t j = 0; j < this->arr.size(); j++) {
		// all 3 rows (and the first+last), print the borders (horizontal)
		if (j % 3 == 0) {
			for (size_t k = 0; k < this->arr.size() + (this->arr.size() / 3); k++) {
				std::cout << "__";
			}
			std::cout << std::endl;
		}

		// go over every column in the current row
		for (size_t i = 0; i < arr[j].size(); i++) {
			// all 3 columns (and the first), print the borders (vertical)
			if (i % 3 == 0) {
				std::cout << "| ";
			}
			std::cout << arr[j][i] << " ";
		}
		// print the last vertical border
		std::cout << "|";
		std::cout << std::endl;
	}
	// print the last horizontal border
	for (size_t k = 0; k < this->arr.size() + (this->arr.size() / 3); k++) {
		std::cout << "__";
	}
	std::cout << std::endl;
}

std::string Field9x9::ToJson() const {
	std::string json = "{"; // start with json object
	json += "\"id\":" + std::to_string(this->id) + ",";
	json += "\"masked\": ["; // first we add the masked matrix in [[,,,],[,,,],[,,,]] form.
	for (size_t j = 0; j < this->arr.size(); j++) {
		json += "[";
		for (size_t i = 0; i < this->arr[j].size(); i++) {
			json += std::to_string(this->arr[j][i]);
			if (i < (this->arr[j].size() - 1)) {
				json += ",";
			}
		}
		json += "]";
		if (j < (this->arr.size() - 1)) {
			json += ",";
		}
	}
	json += "], \"template\": ["; // then we add the template in the same format
	for (size_t j = 0; j < this->perfectSolution.size(); j++) {
		json += "[";
		for (size_t i = 0; i < this->perfectSolution[j].size(); i++) {
			json += std::to_string(this->perfectSolution[j][i]);
			if (i < (this->perfectSolution[j].size() - 1)) {
				json += ",";
			}
		}
		json += "]";
		if (j < (this->perfectSolution.size() - 1)) {
			json += ",";
		}
	}
	json += "]}"; // finalize json
	return json;
}

void Field9x9::fillDiagonals() {
	// iteration over diagonals
	for (size_t i = 0; i < 3; i++) {
		// getting random values and filling them
		auto cRngValues = this->generateRng3x3();
		this->fillDiagonal3x3(i, cRngValues);
	}
}

bool Field9x9::tryMaskN(int cues) {
	// get amount of maskings
	size_t nToKeep = (this->arr.size()* this->arr.size()) - cues;

	// get all possible positions to mask (defined for speed)
	std::array<int, 81> positions;
	for (int i = 0; i < 81; ++i) {
		positions[i] = i;
	}

	// generating random device and twister
	static std::mt19937 rng(std::random_device{}());

	// shuffle positions
	std::shuffle(positions.begin(), positions.end(), rng);

	// mask positions
	auto beforeMasking = this->arr;
	for (size_t i = 0; i < nToKeep; i++) {
		this->arr[positions[i] / 9][positions[i] % 9] = 0;
	}

	// set/reset helpers
	this->usedInRow = std::array<std::bitset<10>, 9>(); // reset usedInRow
	this->usedInCol = std::array<std::bitset<10>, 9>(); // reset usedInCol
	this->usedInGrid = std::array<std::array<std::bitset<10>, 3>, 3>(); // reset usedInGrid
	this->initBitsets();
	
	// check if sudoku is solvable. if it isn't, return false
	auto tmp = this->arr;
	int paths = 0;
	bool solvable = this->solveAllPaths(0,0,paths);
	if (paths <= 1) {
		this->arr = tmp;
		return true;
	}
	this->arr = beforeMasking;
	return false;
}

std::array<std::array<int, 3>, 3> Field9x9::generateRng3x3() const {
	auto cell1d = this->generateRng9();
	std::array<std::array<int, 3>, 3> fullCell = { {
		{std::move(cell1d[0]), std::move(cell1d[1]), std::move(cell1d[2])},
		{std::move(cell1d[3]), std::move(cell1d[4]), std::move(cell1d[5])},
		{std::move(cell1d[6]), std::move(cell1d[7]), std::move(cell1d[8])}
	} };

	return fullCell;
}

std::array<int, 9> Field9x9::generateRng9() const {
	std::array<int, 9> fullcell{ 1,2,3,4,5,6,7,8,9 };

	// using a seed and a better, mersene twister for improved randomness
	static std::mt19937 gen(std::random_device{}());
	std::shuffle(fullcell.begin(), fullcell.end(), gen);

	return fullcell;
}

void Field9x9::fillDiagonal3x3(size_t blockIndex, const std::array<std::array<int, 3>, 3>& cRngValues) {
	for (size_t l = 0; l < 3; l++) {
		std::copy(cRngValues[l].begin(), cRngValues[l].end(), this->arr[blockIndex * 3 + l].begin() + (blockIndex * 3));
	}
}

bool Field9x9::notInBlock(int number, const std::array<std::array<int, 3>, 3>& block) const {
	for (const auto& row : block) {
		for (const auto& elem : row) {
			if (number == elem) {
				return false;
			}
		}
	}
	return true;
}

std::array<std::array<int, 3>, 3> Field9x9::getBlock(int row, int col) const {
	std::array<std::array<int, 3>, 3> block;

	// getting startrows and cols using integer rounding
	int startrow = (row / 3) * 3;
	int startcol = (col / 3) * 3;

	for (size_t j = 0; j < 3; j++) {
		for (size_t i = 0; i < 3; i++) {
			block[j][i] = this->arr[startrow + j][startcol + i];
		}
	}

	return block;
}

bool Field9x9::notInRow(int number, const std::array<int, 9>& row) const {
	for (const auto& elem : row) {
		if (number == elem) {
			return false;
		}
	}
	return true;
}

std::array<int, 9> Field9x9::getRow(int row) const {
	return this->arr[row];
}

bool Field9x9::notInCol(int number, const std::array<int, 9>& column) const {
	for (const auto& elem : column) {
		if (number == elem) {
			return false;
		}
	}
	return true;
}

std::array<int, 9> Field9x9::getCol(int col) const {
	std::array<int, 9> column{};
	for (size_t i = 0; i < this->arr.size(); i++) {
		column[i] = this->arr[i][col];
	}
	return column;
}

void Field9x9::printBlock(const std::array<std::array<int, 3>, 3>& toPrint) const {
	for (const auto& row : toPrint) {
		for (const auto& val : row) {
			std::cout << val << " ";
		}
		std::cout << std::endl;
	}
}

void Field9x9::print1d(const std::array<int, 9>& toPrint) const {
	for (const auto& val : toPrint) {
		std::cout << val << " ";
	}
}

bool Field9x9::solveAllPaths(int row, int col, int& nPaths) {
	// we go from row 0 to 8, 9 is the end
	if (row == 9) {
		nPaths++; // we found a path!
		return (nPaths > 1);
	}

	// we go from col 0 to 8, 9 is the end. go to next
	if (col == 9) {
		return this->solveAllPaths(row + 1, 0, nPaths);
	}

	// if cell is already filled, skip it
	if (this->arr[row][col] > 0) {
		return this->solveAllPaths(row, col + 1, nPaths);
	}

	// check if only one number is missing in row 
	if (this->getBitsetCount(this->usedInRow[row]) == 8) {
		// find number
		for (int i = 1; i <= 9; i++) {
			if (!this->usedInRow[row][i]) { // if found, directly add it and proceed with backtracking
				// set data and shortcuts
				this->arr[row][col] = i;
				this->usedInRow[row][i] = true;
				this->usedInCol[col][i] = true;
				this->usedInGrid[(int)row / 3][int(col / 3)][i] = true;

				if (this->solveAllPaths(row, col + 1, nPaths) && nPaths > 1) {
					// if the rest can be solved, skip the rest of the code
					return true;
				}

				// if it does not work, set 0 again
				this->arr[row][col] = 0;
				this->usedInRow[row][i] = false;
				this->usedInCol[col][i] = false;
				this->usedInGrid[(int)row / 3][int(col / 3)][i] = false;
			}
		}
	}
	
	// check if only one number is missing in col
	if (this->getBitsetCount(this->usedInCol[col]) == 8) {
		// find number
		for (int i = 1; i <= 9; i++) {
			if (!this->usedInCol[col][i]) { // if found, directly add it and proceed with backtracking
				// set data and shortcuts
				this->arr[row][col] = i;
				this->usedInRow[row][i] = true;
				this->usedInCol[col][i] = true;
				this->usedInGrid[(int)row / 3][int(col / 3)][i] = true;

				if (this->solveAllPaths(row, col + 1, nPaths) && nPaths > 1) {
					// if the rest can be solved, skip the rest of the code
					return true;
				}

				// if it does not work, set 0 again
				this->arr[row][col] = 0;
				this->usedInRow[row][i] = false;
				this->usedInCol[col][i] = false;
				this->usedInGrid[(int)row / 3][int(col / 3)][i] = false;
			}
		}
	}

	// check if only one number is missing in cell
	if (this->getBitsetCount(this->usedInGrid[(int)row / 3][int(col / 3)]) == 8) {
		// find number
		for (int i = 1; i <= 9; i++) {
			if (!this->usedInGrid[(int)row / 3][int(col / 3)][i]) { // if found, directly add it and proceed with backtracking
				// set data and shortcuts
				this->arr[row][col] = i;
				this->usedInRow[row][i] = true;
				this->usedInCol[col][i] = true;
				this->usedInGrid[(int)row / 3][int(col / 3)][i] = true;

				if (this->solveAllPaths(row, col + 1, nPaths) && nPaths > 1) {
					// if the rest can be solved, skip the rest of the code
					return true;
				}

				// if it does not work, set 0 again
				this->arr[row][col] = 0;
				this->usedInRow[row][i] = false;
				this->usedInCol[col][i] = false;
				this->usedInGrid[(int)row / 3][int(col / 3)][i] = false;
			}
		}
	}

	// else, we try to fill random numbers
	for (size_t cNumber = 1; cNumber <= 9; ++cNumber) {
		// run all checks if the number is ok
		if (this->usedInRow[row][cNumber] || this->usedInCol[col][cNumber] || this->usedInGrid[(int)row / 3][int(col / 3)][cNumber]) {
			continue;
		}

		// if it works, set number and proceed with solving
		this->arr[row][col] = cNumber;
		this->usedInRow[row][cNumber] = true;
		this->usedInCol[col][cNumber] = true;
		this->usedInGrid[(int)row / 3][int(col / 3)][cNumber] = true;

		// std::cout << row << " " << col << " " << cNumber << std::endl;
		if (this->solveAllPaths(row, col + 1, nPaths) && nPaths > 1) {
			// if the rest can be solved, skip the rest of the code
			return true;
		}

		// if the rest cannot be solved, reset the value
		this->arr[row][col] = 0;
		this->usedInRow[row][cNumber] = false;
		this->usedInCol[col][cNumber] = false;
		this->usedInGrid[(int)row / 3][int(col / 3)][cNumber] = false;
	}
	
	return false;
}

bool Field9x9::getBitsetCount(const std::bitset<10>& bitset) {
	return bitset.count();
}

void Field9x9::mask() {
	int cues = 80;
	while (this->tryMaskN(cues--)) {
	}
}

void Field9x9::initBitsets() {
	for (size_t row = 0; row < 9; row++) {
		for (size_t col = 0; col < 9; col++) {
			if (this->arr[row][col] > 0) {
				this->usedInRow[row][this->arr[row][col]] = true;
				this->usedInCol[col][this->arr[row][col]] = true;
				this->usedInGrid[int(row / 3)][int(col / 3)][this->arr[row][col]] = true;
			}
		}
	}
}

int Field9x9::GetNCues() {
	int n = 0;
	for (const auto& row : this->arr) {
		for (const auto& cValue : row) {
			if (cValue > 0) {
				n++;
			}
		}
	}
	return n;
}

std::unique_ptr<Field9x9> Field9x9::Transpose() {
	std::unique_ptr<Field9x9> temp = std::make_unique<Field9x9>(*this);
	std::array<std::array<int, 9>, 9> transposedArr{};
	std::array<std::array<int, 9>, 9> transposedPerfect{};

	for (size_t j = 0; j < 9; j++) { 
		for (size_t i = 0; i < 9; i++) {
			// Swap the indices for transposition
			transposedArr[i][j] = temp->arr[j][i];
			transposedPerfect[i][j] = temp->perfectSolution[j][i];
		}
	}
	temp->arr = transposedArr;
	temp->perfectSolution = transposedPerfect;
	return temp;
}

std::unique_ptr<Field9x9> Field9x9::Rotate() {
	std::unique_ptr<Field9x9> temp = std::make_unique<Field9x9>(*this);
	temp = temp->Transpose();
	for (size_t i = 0; i < 9; ++i) {
		std::reverse(temp->arr[i].begin(), temp->arr[i].end());
		std::reverse(temp->perfectSolution[i].begin(), temp->perfectSolution[i].end());
	}
	return temp;
}

std::unique_ptr<Field9x9> Field9x9::Increment() {
	std::unique_ptr<Field9x9> temp = std::make_unique<Field9x9>(*this);
	for (size_t j = 0; j < 9; j++) {
		for (size_t i = 0; i < 9; i++) {
			// Increment only if the current value is between 1 and 9
			if (temp->arr[j][i] != 0) {
				temp->arr[j][i] = (temp->arr[j][i] % 9) + 1;  // If 9 -> 1, otherwise increment
			}
			temp->perfectSolution[j][i] = (temp->perfectSolution[j][i] % 9) + 1;
		}
	}
	return temp;
}

std::unique_ptr<Field9x9> Field9x9::Leftshift() {
	Field9x9* newField = new Field9x9(*this);

	for (int i = 0; i < 9; ++i) {
		std::rotate(newField->arr[i].begin(), newField->arr[i].begin() + 3, newField->arr[i].end());
		std::rotate(newField->perfectSolution[i].begin(), newField->perfectSolution[i].begin() + 3, newField->perfectSolution[i].end());
	}

	return std::unique_ptr<Field9x9>(newField);
}

std::unique_ptr<Field9x9> Field9x9::Rightshift() {
	Field9x9* newField = new Field9x9(*this);

	for (int i = 0; i < 9; ++i) {
		std::rotate(newField->arr[i].rbegin(), newField->arr[i].rbegin() + 3, newField->arr[i].rend());
		std::rotate(newField->perfectSolution[i].rbegin(), newField->perfectSolution[i].rbegin() + 3, newField->perfectSolution[i].rend());
	}

	return std::unique_ptr<Field9x9>(newField);
}


std::unique_ptr<Field9x9> Field9x9::Upshift() {
	std::unique_ptr<Field9x9> temp = this->Rotate();
	for (int i = 0; i < 9; ++i) {
		std::rotate(temp->arr[i].begin(), temp->arr[i].begin() + 3, temp->arr[i].end());
		std::rotate(temp->perfectSolution[i].begin(), temp->perfectSolution[i].begin() + 3, temp->perfectSolution[i].end());
	}
	temp = this->Rotate();
	return temp;
}

std::unique_ptr<Field9x9> Field9x9::Downshift() {
	std::unique_ptr<Field9x9> temp = this->Rotate();
	for (int i = 0; i < 9; ++i) {
		std::rotate(temp->arr[i].rbegin(), temp->arr[i].rbegin() + 3, temp->arr[i].rend());
		std::rotate(temp->perfectSolution[i].rbegin(), temp->perfectSolution[i].rbegin() + 3, temp->perfectSolution[i].rend());
	}
	temp = this->Rotate();
	return temp;
}